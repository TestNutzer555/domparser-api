import { JSDOM } from "jsdom";

export default function handler(req, res) {
    try {
        // Ensure the request contains HTML data
        if (!req.body.html) {
            return res.status(400).json({ error: "No HTML data received" });
        }

        // Create a JSDOM instance and DISABLE CSS parsing
        const dom = new JSDOM(req.body.html, {
            resources: "usable",
            runScripts: "dangerously",
            pretendToBeVisual: true,
            beforeParse(window) {
                // Remove stylesheets before parsing
                window.document.querySelectorAll("style, link[rel='stylesheet']").forEach(el => el.remove());
            }
        });

        const document = dom.window.document;

        // Extract all AI tool entries
        const tools = Array.from(document.querySelectorAll(".tool-entry")).map(tool => ({
            tool_name: tool.querySelector("h2")?.textContent.trim() || "Unknown",
            tool_url: tool.querySelector("a")?.href || "Unknown",
            use_case: tool.querySelector(".description")?.textContent.trim() || "Unknown",
            pricing: tool.querySelector(".pricing")?.textContent.trim().toLowerCase() || "Unknown",
            bookmarks: parseInt(tool.querySelector(".bookmarks")?.textContent.trim() || "0"),
            ratings: parseFloat(tool.querySelector(".ratings")?.textContent.trim() || "0"),
        }));

        // Return extracted tools
        return res.status(200).json({ tools });

    } catch (error) {
        console.error("Error processing HTML:", error);
        return res.status(500).json({ error: "Failed to parse HTML" });
    }
}
