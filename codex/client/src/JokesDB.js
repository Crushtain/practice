import React, { useState, useEffect } from 'react';
import './JokesView.css';

const JokesDB = () => {
    const [jokes, setJokes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJokes = async () => {
            try {
                const response = await fetch('http://localhost:5000/db'); // Изменено на путь к вашему API
                if (!response.ok) {
                    throw new Error('Ошибка загрузки анекдотов');
                }
                const data = await response.json();
                // Предполагаем, что ответ - объект с текстом анекдота внутри свойства text
                setJokes(data.map(joke => joke.text));
            } catch (err) {
                console.error('Ошибка при загрузке анекдотов:', err);
                setError('Не удалось загрузить анекдоты.');
            }
        };

        fetchJokes();
    }, []);

    return (
        <div className="joke-container">
            <h1>Анекдоты:</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <ul>
                    {jokes.map((joke, index) => (
                        <li key={index}>{joke}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default JokesDB;