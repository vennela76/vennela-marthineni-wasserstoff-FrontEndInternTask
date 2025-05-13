"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const cluster_1 = __importDefault(require("cluster"));
const numCPUs = 3;
if (cluster_1.default.isPrimary) {
    console.log(`Master ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster_1.default.fork();
        console.log(`Worker ${worker.process.pid} started`);
    }
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log("Starting a new worker");
        const newWorker = cluster_1.default.fork();
        console.log(`Worker ${newWorker.process.pid} started`);
    });
}
else {
    const client = (0, redis_1.createClient)();
    const pubClient = (0, redis_1.createClient)();
    function processSubmission(submission) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code, language, roomId, submissionId, input } = JSON.parse(submission);
            console.log(`Processing submission for room id: ${roomId}, submission id: ${submissionId}`);
            // Create unique directory for code execution
            const absoluteCodeDir = path_1.default.resolve(`./tmp/user-${Date.now()}`);
            yield promises_1.default.mkdir(absoluteCodeDir, { recursive: true });
            let codeFilePath = "";
            let dockerCommand = "";
            const inputFilePath = path_1.default.join(absoluteCodeDir, "input.txt");
            try {
                // Write input file
                yield promises_1.default.writeFile(inputFilePath, input, "utf8");
                // Generate code file and Docker command based on language
                switch (language) {
                    case "javascript":
                        codeFilePath = path_1.default.join(absoluteCodeDir, "userCode.js");
                        yield promises_1.default.writeFile(codeFilePath, code);
                        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" node:18 sh -c "node /usr/src/app/${path_1.default.basename(codeFilePath)} /usr/src/app/input.txt"`;
                        break;
                    case "python":
                        codeFilePath = path_1.default.join(absoluteCodeDir, "userCode.py");
                        yield promises_1.default.writeFile(codeFilePath, code);
                        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" python:3.9 sh -c "python /usr/src/app/${path_1.default.basename(codeFilePath)} /usr/src/app/input.txt"`;
                        break;
                    case "cpp":
                        codeFilePath = path_1.default.join(absoluteCodeDir, "userCode.cpp");
                        yield promises_1.default.writeFile(codeFilePath, code);
                        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 \
-v "${absoluteCodeDir.replace(/\\/g, "/")}:/usr/src/app" gcc:11  \
sh -c "g++ /usr/src/app/userCode.cpp -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`;
                        break;
                    case "rust":
                        codeFilePath = path_1.default.join(absoluteCodeDir, "userCode.rs");
                        yield promises_1.default.writeFile(codeFilePath, code);
                        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" rust:latest sh -c "rustc /usr/src/app/userCode.rs -o /usr/src/app/a.out && /usr/src/app/a.out < /usr/src/app/input.txt"`;
                        break;
                    case "java":
                        codeFilePath = path_1.default.join(absoluteCodeDir, "UserCode.java");
                        yield promises_1.default.writeFile(codeFilePath, code);
                        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" openjdk:17 sh -c "javac /usr/src/app/UserCode.java && java -cp /usr/src/app UserCode < /usr/src/app/input.txt"`;
                        break;
                    case "go":
                        codeFilePath = path_1.default.join(absoluteCodeDir, "userCode.go");
                        yield promises_1.default.writeFile(codeFilePath, code);
                        dockerCommand = `docker run --rm --memory="256m" --cpus="1.0" --pids-limit 100 -v "${absoluteCodeDir}:/usr/src/app" golang:1.18 sh -c "go run /usr/src/app/userCode.go < /usr/src/app/input.txt"`;
                        break;
                    default:
                        throw new Error("Unsupported language");
                }
            }
            catch (error) {
                console.error("Failed to prepare code file or Docker command:", error);
                return;
            }
            // Execute Docker command
            (0, child_process_1.exec)(dockerCommand, (error, stdout, stderr) => __awaiter(this, void 0, void 0, function* () {
                let result = stdout || stderr;
                if (error) {
                    result = `Error: ${error.message}`;
                }
                console.log(`Result for room ${roomId}: ${result}`);
                try {
                    yield pubClient.publish(roomId, result);
                }
                catch (err) {
                    console.error("Failed to publish result to Redis:", err);
                }
                // Clean up by removing the created directory
                try {
                    yield promises_1.default.rm(absoluteCodeDir, { recursive: true, force: true });
                }
                catch (cleanupError) {
                    console.error("Failed to clean up directory:", cleanupError);
                }
            }));
        });
    }
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield client.connect();
                yield pubClient.connect();
                console.log("Redis Client Connected");
                while (true) {
                    const submission = yield client.brPop("problems", 0);
                    console.log("Processing submission...");
                    if (submission) {
                        yield processSubmission(submission.element);
                    }
                }
            }
            catch (error) {
                console.error("Failed to connect to Redis:", error);
            }
        });
    }
    main();
}
