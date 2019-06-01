/* global bootbox */
$(document).ready(function() {
    // setting class article-container div where all the content will go
    // adding event listeners to any dynamically generated "save article" & "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);

    // once the page is ready, run the initPage function to kick things off
    initPage();
    
    function initPage() {
        // empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
          .then(function(data) {
              // if we have headlines, render them to the page
              if (data && data.length) {
                  renderArticles(data);
              } else {
                  // otherwise render a message explaining we have no articles
                  renderEmpty();
              }
            });
        }

        function renderArticles(articles) {
            // this function handles appending html containing our article data to the page with an array of JSON with all available articles
            var articlePanels = [];
            // pass each article JSON object to the createPanel function which returns a bootstrap panel with article data inside
            for (var i = 0; i < articles.length; i++) {
                articlePanels.push(createPanel(articles[i]));
            }
            // once we have all of the HTML for the articles stored in our articlePanels array, append them to the articlePanels container
            articleContainer.append(articlePanels);
        }

        function createPanel(article) {
            // this function takes in a single JSON object for an article/headline
            // it constructs a jQuery element containing all of the formatted HTML for the article panel
            var panel =
            $(["<div class='panel panel-default'>",
              "<div class='panel-heading'>",
              "<h4>",
              article.headline,
              "</h4>",
              "</div>",
              "<div class='panel-body'>",
              "<a class='readLink btn btn-secondary' href='"+article.url+"' target='_parent'>Read Article",
              "</a>",
              "<a class='btn btn-success save'>",
              "Save Article",
              "</a>",
              "</div>",
              "</div>"
        ].join(""));
        // we attach the article's id to the jQuery element & will use this when trying to figure out which article the user wants to save
      panel.data("_id", article._id);
      // return the constructed panel jQuery element
      return panel;
    }
    function renderEmpty() {
        // this function renders some HTML to the page saying we don't have any articles to view
        var emptyAlert =
        $(["<div class='alert alert-warning text-center'>",
          "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
          "</div>",
          "<div class='panel panel-default'>",
          "<div class='panel-heading text-center'>",
          "<h3>What Would You Like To Do?</h3>",
          "</div>",
          "<div class='panel-body text-center'>",
          "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
          "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
          "</div>",
          "</div>"
    ].join(""));
    // appending this data to the page
    articleContainer.append(emptyAlert);
}

function handleArticleSave() {
    // this function is triggered when the user wants to save an article
    var articleToSave = $(this).parents(".panel").data();
    articleToSave.saved = true;
    // using a patch method to be semantic since this updates an existing record in our collection
    $.ajax({
        method: "PATCH",
        url: "/api/headlines",
        data: articleToSave
    })
    .then(function(data) {
        // if success, mongoose will send back an object with a key of "ok" (value of 1 which equals true)
        if (data.ok) {
            // run the initPage function again to reload the list of articles
            initPage();
        }
    });
}

function handleArticleScrape() {
    // this function handles the user clicking any "scrape new article" buttons
    $.get("/api/fetch")
      .then(function(data) {
          // if scrape of NYTIMES successful & compared the articles to the ones in our collection, re-render articles to the page
          // and let the user know how many unique articles we were able to save
          initPage();
          bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
      });
    }
});
