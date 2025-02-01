const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async (req, res) => {
    try {
        if (!req.body.html) {
            return res.status(400).json({ error: "No HTML data provided" });
        }

        // Parse HTML
        const dom = new JSDOM(req.body.html);
        const document = dom.window.document;

        // Extract AI tool entries
        const tools = Array.from(document.querySelectorAll(".tool-entry")).map(tool => ({
            tool_name: tool.querySelector("h2")?.textContent.trim() || "Unknown",
            tool_url: tool.querySelector("a")?.href || "Unknown",
            use_case: tool.querySelector(".description")?.textContent.trim() || "Unknown",
            pricing: tool.querySelector(".pricing")?.textContent.trim().toLowerCase() || "Unknown",
            bookmarks: parseInt(tool.querySelector(".bookmarks")?.textContent.trim() || "0", 10),
            ratings: parseFloat(tool.querySelector(".ratings")?.textContent.trim() || "0")
        }));

        // Filter Tools based on Criteria
        const validTools = tools.filter(tool =>
            (tool.pricing.includes("free") || tool.pricing.includes("freemium")) &&
            !tool.pricing.includes("free trial") &&
            tool.bookmarks >= 50 &&
            tool.ratings >= 3.0
        );

        // Sort by Relevance (Mock scoring based on use case relevance)
        validTools.sort((a, b) => b.use_case.includes("content writing") - a.use_case.includes("content writing"));

        return res.json({ tools: validTools });

    } catch (error) {
        console.error("Error parsing HTML:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
