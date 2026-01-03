"use client";
import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);

  useEffect(() => {
    const initTerminal = async () => {
      if (terminalRef.current && !xtermRef.current) {
        const term = new Xterm({
          cursorBlink: true,
          fontSize: 12,
          fontFamily: "Menlo, courier-new, courier, monospace",
          theme: {
            background: "#1a1b26",
            foreground: "#a9b1d6",
            cursor: "#c0caf5",
            black: "#32344a",
            red: "#f7768e",
            green: "#9ece6a",
            yellow: "#e0af68",
            blue: "#7aa2f7",
            magenta: "#ad8ee6",
            cyan: "#449dab",
            white: "#787c99",
            brightBlack: "#444b6a",
            brightRed: "#ff7a93",
            brightGreen: "#b9f27c",
            brightYellow: "#ff9e64",
            brightBlue: "#7da6ff",
            brightMagenta: "#bb9af7",
            brightCyan: "#0db9d7",
            brightWhite: "#acb0d0",
          },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new WebLinksAddon());

        term.open(terminalRef.current);
        fitAddon.fit();

        term.writeln("Welcome to the terminal!");
        term.writeln("");
        term.write("> ");

        let currentLine = "";
        term.onData((data) => {
          if (data === "\r") {
            // Enter key
            term.writeln("");
            handleCommand(term, currentLine);
            currentLine = "";
            term.write("> ");
          } else if (data === "\x7F") {
            // Backspace
            if (currentLine.length > 0) {
              currentLine = currentLine.slice(0, -1);
              term.write("\b \b");
            }
          } else if (data === "\u0003") {
            // Ctrl+C
            term.write("^C");
            term.writeln("");
            currentLine = "";
            term.write("> ");
          } else {
            currentLine += data;
            term.write(data);
          }
        });

        xtermRef.current = term;
      }
    };
    initTerminal();
  }, []);

  return (
    <section>
      <div className="flex items-center p-2 border-b justify-between">
        Terminal
      </div>
      <div ref={terminalRef} className="p-2" />
    </section>
  );
}

function handleCommand(term: Xterm, command: string) {
  const cmd = command.trim();

  switch (cmd) {
    case "help":
      term.writeln("Available commands:");
      term.writeln("  help    - Show this help message");
      term.writeln("  clear   - Clear the terminal");
      term.writeln("  echo    - Echo text back");
      term.writeln("  date    - Show current date and time");
      break;
    case "clear":
      term.clear();
      break;
    case "date":
      term.writeln(new Date().toString());
      break;
    case "":
      break;
    default:
      if (cmd.startsWith("echo ")) {
        term.writeln(cmd.substring(5));
      } else {
        term.writeln(`Command not found: ${cmd}`);
        term.writeln("Type 'help' for available commands");
      }
  }
}
