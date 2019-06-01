// require request & cheerio for scraping
var request = require("request");
var cheerio = require("cheerio");

var scrape = function (callback) {
    request("http://www.nytimes.com/section/us", function(err, res, body) {
        var $ = cheerio.load(body);

        var articles = [];

        // $("article h2").each(function(i, element) {
        //     var head = $(this).children("a").text().trim();
        //     var sum = $(this).children("a").attr("href").trim();
            // var sum = $(this).parent().closest("p").text().trim();
        $("article h2").each(function(i, element) {
            var head = $(this).children("a").text().trim();
            var url = $(this).children("a").attr("href").trim();
            // var sum = $(this).children("a").attr("href").trim();
            var sum = $("h2").parent("div").closest("p").text().trim();

            if(head && url) {
                var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                var urlNeat = "https://www.nytimes.com" + url.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

                var dataToAdd = {
                    headline: headNeat,
                    url: urlNeat,
                    summary: sumNeat
                };
                articles.push(dataToAdd);
            }
        });
        callback(articles);
    });
};
module.exports = scrape;

