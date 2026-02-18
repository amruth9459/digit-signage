import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// AI Imports
import { generateThemeFromPrompt, generateMarketingCopy, generateImagePlaceholder } from './ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve Mutable Data (Public) - Prioritize over build artifacts
// This ensures runtime changes to config.json/promotions.json are served immediately
const PUBLIC_DIR = path.join(__dirname, '../public');
app.use(express.static(PUBLIC_DIR));

// Serve Static Files (Production Build)
app.use(express.static(path.join(__dirname, '../dist')));

// Configure Multer for Image Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(PUBLIC_DIR, 'products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize filename
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        cb(null, safeName);
    }
});
const upload = multer({ storage: storage });

// --- API Endpoints ---

// Helper to get project file paths
const getProjectPaths = (projectId = 'default') => {
    // Sanitize projectId to prevent directory traversal
    const safeId = projectId.replace(/[^a-z0-9_-]/gi, '');
    const projectDir = path.join(PUBLIC_DIR, 'projects', safeId);
    return {
        dir: projectDir,
        config: path.join(projectDir, 'config.json'),
        promotions: path.join(projectDir, 'promotions.json')
    };
};

// Get Projects List
app.get('/api/projects', (req, res) => {
    const projectsDir = path.join(PUBLIC_DIR, 'projects');
    if (!fs.existsSync(projectsDir)) {
        return res.json(['default']);
    }
    const projects = fs.readdirSync(projectsDir).filter(file => {
        return fs.statSync(path.join(projectsDir, file)).isDirectory();
    });
    res.json(projects);
});

// Create New Project
app.post('/api/projects', (req, res) => {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const paths = getProjectPaths(projectId);
    if (fs.existsSync(paths.dir)) {
        return res.status(400).json({ error: 'Project already exists' });
    }

    try {
        fs.mkdirSync(paths.dir, { recursive: true });
        // Copy default config/promotions if available, else create empty
        const defaultPaths = getProjectPaths('default');

        if (fs.existsSync(defaultPaths.config)) {
            fs.copyFileSync(defaultPaths.config, paths.config);
        } else {
            fs.writeFileSync(paths.config, JSON.stringify({ theme: 'dark_luxury' }));
        }

        if (fs.existsSync(defaultPaths.promotions)) {
            fs.copyFileSync(defaultPaths.promotions, paths.promotions);
        } else {
            fs.writeFileSync(paths.promotions, '[]');
        }

        // New: Copy Schedule
        const defaultSchedule = path.join(PUBLIC_DIR, 'projects/default/schedule.json');
        const newSchedule = path.join(paths.dir, 'schedule.json');
        if (fs.existsSync(defaultSchedule)) {
            fs.copyFileSync(defaultSchedule, newSchedule);
        } else {
            fs.writeFileSync(newSchedule, '[]');
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Get Config (Project Aware)
app.get('/api/config', (req, res) => {
    try {
        const projectId = req.query.project || 'default';
        const paths = getProjectPaths(projectId);

        if (fs.existsSync(paths.config)) {
            const data = fs.readFileSync(paths.config, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json({});
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read config' });
    }
});

// Update Config (Project Aware)
app.post('/api/config', (req, res) => {
    try {
        const projectId = req.query.project || 'default';
        const paths = getProjectPaths(projectId);

        // Ensure dir exists (sanity check)
        if (!fs.existsSync(paths.dir)) {
            fs.mkdirSync(paths.dir, { recursive: true });
        }

        fs.writeFileSync(paths.config, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save config' });
    }
});

// Get Promotions (Project Aware)
app.get('/api/promotions', (req, res) => {
    try {
        const projectId = req.query.project || 'default';
        const paths = getProjectPaths(projectId);

        if (fs.existsSync(paths.promotions)) {
            const data = fs.readFileSync(paths.promotions, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read promotions' });
    }
});

// Update Promotions (Project Aware)
app.post('/api/promotions', (req, res) => {
    try {
        const projectId = req.query.project || 'default';
        const paths = getProjectPaths(projectId);

        if (!fs.existsSync(paths.dir)) {
            fs.mkdirSync(paths.dir, { recursive: true });
        }

        fs.writeFileSync(paths.promotions, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save promotions' });
    }
});

// --- Scheduling Endpoints ---
app.get('/api/schedule', (req, res) => {
    try {
        const projectId = req.query.project || 'default';
        const schedulePath = path.join(PUBLIC_DIR, 'projects', projectId, 'schedule.json');

        if (fs.existsSync(schedulePath)) {
            res.json(JSON.parse(fs.readFileSync(schedulePath, 'utf8')));
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read schedule' });
    }
});

app.post('/api/schedule', (req, res) => {
    try {
        const projectId = req.query.project || 'default';
        const projectDir = path.join(PUBLIC_DIR, 'projects', projectId);
        if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

        const schedulePath = path.join(projectDir, 'schedule.json');
        fs.writeFileSync(schedulePath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save schedule' });
    }
});

// Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the relative path for the frontend to use
    res.json({
        success: true,
        filePath: `/products/${req.file.filename}`
    });
});

// --- Device Management Endpoints ---

const getDevices = () => {
    const devicesPath = path.join(PUBLIC_DIR, 'devices.json');
    if (!fs.existsSync(devicesPath)) return [];
    try {
        return JSON.parse(fs.readFileSync(devicesPath, 'utf8'));
    } catch (e) { return []; }
};

const saveDevices = (devices) => {
    const devicesPath = path.join(PUBLIC_DIR, 'devices.json');
    fs.writeFileSync(devicesPath, JSON.stringify(devices, null, 2));
};

// Register Device (Player calls this)
app.post('/api/devices/register', (req, res) => {
    const { deviceId, code, name } = req.body;
    let devices = getDevices();

    const existing = devices.find(d => d.id === deviceId);
    if (existing) {
        return res.json({ success: true, device: existing });
    }

    const newDevice = {
        id: deviceId,
        code: code, // e.g., "AF32"
        name: name || `Display ${devices.length + 1}`,
        projectId: null,
        status: 'pending',
        lastSeen: Date.now()
    };

    devices.push(newDevice);
    saveDevices(devices);
    res.json({ success: true, device: newDevice });
});

// Poll Status (Player calls this)
app.get('/api/devices/poll/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const devices = getDevices();
    const device = devices.find(d => d.id === deviceId);

    if (device) {
        // Update last seen
        device.lastSeen = Date.now();
        saveDevices(devices);
        res.json({ assignedProject: device.projectId, status: device.status });
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

// List Devices (Admin calls this)
app.get('/api/devices', (req, res) => {
    res.json(getDevices());
});

// Assign Project (Admin calls this)
app.post('/api/devices/assign', (req, res) => {
    const { deviceId, projectId } = req.body;
    let devices = getDevices();
    const deviceIndex = devices.findIndex(d => d.id === deviceId);

    if (deviceIndex !== -1) {
        devices[deviceIndex].projectId = projectId;
        devices[deviceIndex].status = 'active';
        saveDevices(devices);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

// Unassign/Delete Device
app.post('/api/devices/delete', (req, res) => {
    const { deviceId } = req.body;
    let devices = getDevices();
    const newDevices = devices.filter(d => d.id !== deviceId);
    saveDevices(newDevices);
    res.json({ success: true });
});

// List Media Endpoint (CMS 3.0)
app.get('/api/media', (req, res) => {
    const uploadDir = path.join(PUBLIC_DIR, 'products');
    if (!fs.existsSync(uploadDir)) {
        return res.json([]);
    }
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).json([]);
        }
        // Filter for images and map to web paths
        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => ({
                name: file,
                path: `/products/${file}`,
                url: `/products/${file}`
            }));
        res.json(imageFiles);
    });
});

// --- AI Endpoints ---
app.get('/api/ai/theme', (req, res) => {
    const prompt = req.query.prompt || '';
    const theme = generateThemeFromPrompt(prompt);
    res.json(theme);
});

app.get('/api/ai/copy', (req, res) => {
    const product = req.query.product || 'Product';
    const copy = generateMarketingCopy(product);
    res.json(copy);
});

app.get('/api/ai/image', (req, res) => {
    const prompt = req.query.prompt || 'product';
    const imageUrl = generateImagePlaceholder(prompt);
    res.json({ url: imageUrl });
});

// Handle React Routing (SPA fallback)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`CMS Server running at http://localhost:${PORT}`);
    console.log(`- Digital Signage: http://localhost:${PORT}/`);
    console.log(`- Admin Dashboard: http://localhost:${PORT}/admin`);
});
