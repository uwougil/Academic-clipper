using System;
using System.Diagnostics;
using System.IO;

namespace AcademicClipper {
    class Launcher {
        static int Main(string[] args) {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string scriptPath = Path.Combine(baseDir, "launcher.mjs");

            string nodeExe = "node";
            string nodePathFile = Path.Combine(baseDir, ".node-path.txt");
            if (File.Exists(nodePathFile)) {
                try {
                    string saved = File.ReadAllText(nodePathFile).Trim();
                    if (File.Exists(saved)) {
                        nodeExe = saved;
                    }
                } catch {}
            }

            ProcessStartInfo psi = new ProcessStartInfo {
                FileName = nodeExe,
                Arguments = "\"" + scriptPath + "\"",
                UseShellExecute = false,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
            };

            try {
                using (Process process = Process.Start(psi)) {
                    System.Threading.Tasks.Task inputTask = System.Threading.Tasks.Task.Run(() => {
                        try {
                            using (Stream stdin = Console.OpenStandardInput()) {
                                byte[] buffer = new byte[4096];
                                int read;
                                while ((read = stdin.Read(buffer, 0, buffer.Length)) > 0) {
                                    process.StandardInput.BaseStream.Write(buffer, 0, read);
                                    process.StandardInput.BaseStream.Flush();
                                }
                            }
                            process.StandardInput.Close();
                        } catch {}
                    });

                    System.Threading.Tasks.Task outputTask = System.Threading.Tasks.Task.Run(() => {
                        try {
                            using (Stream stdout = Console.OpenStandardOutput()) {
                                byte[] buffer = new byte[4096];
                                int read;
                                while ((read = process.StandardOutput.BaseStream.Read(buffer, 0, buffer.Length)) > 0) {
                                    stdout.Write(buffer, 0, read);
                                    stdout.Flush();
                                }
                            }
                        } catch {}
                    });

                    System.Threading.Tasks.Task errorTask = System.Threading.Tasks.Task.Run(() => {
                        try {
                            process.StandardError.BaseStream.CopyTo(Stream.Null);
                        } catch {}
                    });

                    process.WaitForExit();
                    outputTask.Wait(5000);
                    errorTask.Wait(1000);
                    return process.ExitCode;
                }
            } catch {
                return 1;
            }
        }
    }
}
