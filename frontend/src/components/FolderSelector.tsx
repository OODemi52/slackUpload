import React, { useState } from 'react';

interface FolderSelectorProps {
    onFolderChange: (dirName: string, files: FileList | null) => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ onFolderChange }) => {
    const [folderName, setFolderName] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const folderPath = files[0].webkitRelativePath;
            const dirName = folderPath.split('/')[0];
            setFolderName(dirName);

            const filesInSelectedFolder = Array.from(files).filter(file => {
                const relativePath = file.webkitRelativePath;
                return relativePath.substring(0, relativePath.lastIndexOf('/')) === dirName;
            });

            // Convert the array of files (File[]) to a FileList
            const dataTransfer = new DataTransfer();
            filesInSelectedFolder.forEach(file => dataTransfer.items.add(file));
            onFolderChange(dirName, dataTransfer.files);
        } else {
            onFolderChange('', null);
        }
    };

    return (
        <div>
            <label htmlFor="dir" className="custom-file-upload">
                {folderName === "" ? "Choose Folder" : folderName}
            </label>
            <input 
                type="file" 
                id="dir" 
                webkitdirectory="true" 
                directory='' 
                onChange={handleChange} />
        </div>
    );
};

export default FolderSelector;
