import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Sortable Item Component ---
const SortableItem = ({ id, text, visible, onChange, onToggle, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#333',
        padding: '8px',
        borderRadius: '4px',
        marginBottom: '8px',
        border: '1px solid #444',
    };

    return (
        <div ref={setNodeRef} style={style}>
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab', color: '#666', padding: '0 5px', fontSize: '18px' }}
            >
                ⋮⋮
            </div>

            {/* Visibility Toggle */}
            <button
                onClick={() => onToggle(id)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: visible ? '#4caf50' : '#666',
                    fontSize: '16px',
                    padding: '0 5px'
                }}
                title={visible ? "Visible" : "Hidden"}
            >
                {visible ? '👁' : '✕'}
                {/* Using a simple X for hidden to differentiate clearer than closed eye if unavailable */}
            </button>

            {/* Text Input */}
            <input
                value={text}
                onChange={(e) => onChange(id, e.target.value)}
                style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    background: '#222',
                    color: visible ? '#fff' : '#777',
                    textDecoration: visible ? 'none' : 'line-through'
                }}
            />

            {/* Delete Button */}
            <button
                onClick={() => onDelete(id)}
                style={{
                    padding: '5px 10px',
                    background: 'transparent',
                    color: '#ff4d4d',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                ✕
            </button>
        </div>
    );
};

// --- Main List Editor ---
const ListEditor = ({ itemsData, onChange }) => {
    const [items, setItems] = useState([]);

    // Initialize/Sync State
    useEffect(() => {
        if (!itemsData) {
            setItems([]);
            return;
        }

        let parsedItems = [];

        // Handle Legacy String Format (newline separated)
        if (typeof itemsData === 'string') {
            parsedItems = itemsData.split('\n').map(text => ({
                id: generateId(),
                text: text,
                visible: true
            }));
        }
        // Handle New Array Format
        else if (Array.isArray(itemsData)) {
            // Ensure every item has an ID
            parsedItems = itemsData.map(item => ({
                ...item,
                id: item.id || generateId(),
                visible: item.visible !== false // default to true
            }));
        }

        setItems(parsedItems);
    }, [itemsData]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newOrder = arrayMove(items, oldIndex, newIndex);

            setItems(newOrder);
            onChange(newOrder); // Propagate up immediately
        }
    };

    const handleTextChange = (id, newText) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, text: newText } : item
        );
        setItems(newItems);
        onChange(newItems);
    };

    const handleToggleVisibility = (id) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, visible: !item.visible } : item
        );
        setItems(newItems);
        onChange(newItems);
    };

    const handleDelete = (id) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        onChange(newItems);
    };

    const handleAddItem = () => {
        const newItem = {
            id: generateId(),
            text: 'New Item',
            visible: true
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        onChange(newItems);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((item) => (
                        <SortableItem
                            key={item.id}
                            id={item.id}
                            text={item.text}
                            visible={item.visible}
                            onChange={handleTextChange}
                            onToggle={handleToggleVisibility}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </SortableContext>

            <button
                onClick={handleAddItem}
                style={{
                    width: '100%',
                    padding: '10px',
                    background: '#333',
                    color: '#ccc',
                    border: '1px dashed #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    fontWeight: 500
                }}
            >
                + Add List Item
            </button>
        </DndContext>
    );
};

export default ListEditor;
