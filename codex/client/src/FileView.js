import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const FileView = () => {
    const { filename } = useParams();
    const [content, setContent] = useState('');
    const [fileType, setFileType] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/${filename}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении файла');
                }
                const contentType = response.headers.get('content-type');
                setFileType(contentType);
                return contentType.includes('application/json') ? response.json() : response.text();
            })
            .then((data) => {
                setContent(data);
                setError(null);
            })
            .catch((error) => {
                console.error('Ошибка:', error);
                setError('Файл не найден или произошла ошибка при получении');
            });
    }, [filename]);

    const renderContent = () => {
        const extname = filename.split('.').pop();
        if (extname === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        } else if (extname === 'png') {
            return <img src={`http://localhost:5000/${filename}`} alt={filename} />;
        } else if (extname === 'txt') {
            return <pre>{content}</pre>;
        } else if (extname === 'json') {
            try {
                return <pre>{JSON.stringify(content, null, 2)}</pre>;
            } catch (error) {
                console.error('Ошибка при парсинге JSON:', error);
                return <div>Ошибка при парсинге JSON: {error.message}</div>;
            }
        }
        return <div>Неподдерживаемый формат файла</div>;
    };

    return (
        <div className="fileview-container">
            <h1>Содержимое файла: {filename}</h1>
            {error ? ( // Проверяем на наличие ошибки
                <div style={{ color: 'red' }}>{error}</div>
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default FileView;
