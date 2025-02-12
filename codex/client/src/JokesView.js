import React, { useState, useEffect } from 'react';
import './JokesView.css';
const Jokes = () => {
    const [jokes, setJokes] = useState([]);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchJokes = async () => {
            try {
                const response = await fetch('http://localhost:5000/jokes');
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const jokesList = doc.querySelectorAll('li');
                const jokesArray = Array.from(jokesList).map((joke) => joke.textContent);
                setJokes(jokesArray);
            } catch (err) {
                console.error('Ошибка при загрузке анекдотов:', err);
                setError('Не удалось загрузить анекдоты.');
            }
        };

        fetchJokes();
    }, []);
    console.log("тест 3")
    // Рендер компонента
    const handleSaveJoke = async (joke) => {
        try {
            const response = await fetch('http://localhost:5000/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: joke }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении анекдота');
            }

            const result = await response.json();
            alert(result.message); // Сообщение с сервера, если нужно показать
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="joke-container">
            <h1 className="joke-container">Анекдоты:</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <ul>
                    {jokes.map((joke, index) => (
                        <li key={index}>{joke}
                            <button onClick={() => handleSaveJoke(joke)}>
                            Сохранить
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
export default Jokes;