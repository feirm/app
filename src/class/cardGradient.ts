export default class CardGradient {
    // Coins and their 2 logo colours to be used in a gradient
    // Colours should go from dark > light (top to bottom)
    // TODO Fetch this data from an API in future
    private gradients = [
        {
            ticker: "xfe",
            colours: ["#cb4f2b", "#f69738"],
            logo: require("../assets/img/card_logos/xfe.png")
        },
        {
            ticker: "btc",
            colours: ["#ff7e00", "#f7931a"],
            logo: require("../assets/img/card_logos/btc.png")
        },
        {
            ticker: "doge",
            colours: ["#a17c34", "#e5cb7a"],
            logo: require("../assets/img/card_logos/doge.png")
        },
        {
            ticker: "xln",
            colours: ["#043483", "#026397"],
            logo: require("../assets/img/card_logos/xln.png")
        },
        {
            ticker: "scc",
            colours: ["#64bbe8", "#0c5abb"]
        }
    ]

    // Return the assembled linear-gradient string based on the coin ticker
    getGradient(ticker: string): string {
        const lowerTicker = ticker.toLowerCase();

        // Find the appropriate gradient index
        const gradientIndex = this.gradients.map(gradient => gradient.ticker).indexOf(lowerTicker);
        const gradient = this.gradients[gradientIndex];

        // Default back to grey gradient if a gradient isn't available
        if (!gradient) {
            return `linear-gradient(#242424, #1c1c1c)`
        }

        // Return assembled string
        const linearGradient = `url(${gradient.logo}) no-repeat bottom right, linear-gradient(${gradient.colours[0]}, ${gradient.colours[1]})`;
        return linearGradient;
    }
}