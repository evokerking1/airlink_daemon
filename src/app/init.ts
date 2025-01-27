import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const execAsync = promisify(exec);

export async function init() {
    const isDockerInstalled = async () => {
        const command = process.platform === 'win32' ? 'docker --version' : 'which docker';

        try {
            await execAsync(command);
        } catch (error) {
            console.error("Docker is not installed. Please install Docker and try again.");
            throw error;
        }
    };

    const isDockerRunning = async () => {
        const command = process.platform === 'win32' ? 'docker ps' : 'docker ps -q';

        try {
            await execAsync(command);
        } catch (error) {
            console.error("Docker is not running. Please start Docker and try again.");
            process.exit(1);
        }
    };

    const isDockerModemFix = async () => {
        // Dockerode Fix for Windows
        if (process.platform === 'win32') {
            const lockFilePath = path.join(__dirname, "..", '..', 'node_modules', 'docker-modem', 'lib', 'docker_modem_fix.lock');
            const modemPath = path.join(__dirname, "..", '..', 'node_modules', 'docker-modem', 'lib', 'modem.js');
            const modemUrl = 'https://raw.githubusercontent.com/achul123/docker-modem/refs/heads/master/lib/modem.js';
        
            if (!fs.existsSync(lockFilePath)) {
                console.log('Fixing docker-modem for windows...');
                // download the file and save in /node_modules/docker-modem/lib/modem.js
                const response = await axios.get(modemUrl);
                const data = response.data;
                await fs.promises.writeFile(modemPath, data, { encoding: 'utf8' });
            
                // Create the lock file to prevent future executions
                await fs.promises.writeFile(lockFilePath, 'Docker-modem fix applied', { encoding: 'utf8' });
                console.log('Docker-modem fix applied');
            }
        }
    }

    try {
        await isDockerInstalled();
        await isDockerRunning();
        await isDockerModemFix();
    } catch (error) {
        console.error("Initialization error:", error);
    }
}