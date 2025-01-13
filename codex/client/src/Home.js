import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const Home = () => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000')
            .then((response) => response.text())
            .then((html) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const buttons = doc.querySelectorAll('button');

                const filesArray = Array.from(buttons).map((button) => button.innerText);
                setFiles(filesArray);
            })
            .catch((error) => {
                console.error('Ошибка при получении списка файлов:', error);
            });
    }, []);

    return (
        <div className="home-container">
            <h1>Список файлов:</h1>
            {files.map((file) => (
                <div key={file}>
                    <Link to={`/${file}`}>
                        <button>{file}</button>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default Home;