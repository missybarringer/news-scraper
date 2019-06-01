$(document).ready(function() {
    // getting reference to the article container div to render all articles inside of
    var articleContainer = $(".article-container");
    // adding event listeners for dynamically generated buttons for deleting articles
    // pulling up article notes, saving article notes, & deleting article notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);

    // initPage kicks everything off when the page is loaded
    initPage();

    function initPage() {
        // empty the article container, run and AJAX request for any saved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true").then(function(data) {
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
        // this function handles appending HTML containing our article data to the page via JSON array of all available articles in database
        var articlePanels = [];
        // we pass each article JSON object to the createPanel function which returns a bootstrap panel with our article data inside
        for (var i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        // once we have all of the HTML for the articles stored in our articlePanels array, append them to the articlePanels container
        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        // this function takes in a single JSON object for an article/headline & constructs a jQuery element containing all of the formatted HTML for the article panel
        var panel = 
        $(["<div class ='panel panel-default'>",
          "<div class='panel-heading'>",
          "<h4>",
          article.headline,
          "</h4>",
          "</div>",
          "<div class='panel-body'>",
          "<a class='readLink btn btn-secondary' href='"+article.url+"' target='_blank' rel='noopener'>Read Article",
          "</a>",
          "<a class='btn btn-danger delete'>",
          "Delete From Saved",
          "</a>",
          "<a class='readLink btn btn-info notes'>Article Notes</a>",
          "</div>",
          "</div>"
        ].join(""));
      // attach the article's id to the jQuery element & use this when figuring out which article the user wants to remove or open notes for
      panel.data("_id", article._id);
      // we return the constructed panel jQuery element
      return panel;
    }

    function renderEmpty() {
        // this function renders some HTML to the page saying we don't have any articles to view using a joined array of HTML
        // string data because it's easier to read/change than a concatenated string
        var emptyAlert =
        $(["<div class='alert alert-warning text-center'>",
          "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
          "</div>",
          "<div class='panel panel-default'>",
          "<div class='panel-heading text-center'>",
          "<h4>Would You Like to Browse Available Articles?</h4>",
          "</div>",
          "<div class='panel-body text-center'>",
          "<h4><a href='/'>Browse Articles</a></h4>",
          "</div>",
          "</div>"
        ].join(""));
      // appending data to page
      articleContainer.append(emptyAlert);
    }

    function renderNotesList(data) {
        // this function handles rendering note list items to our notes modal - setting up an array of notes to render after finished
        // also setting up a currentNote variable to temporarily store each note
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            // if we have no notes, just display a message explaining this
            currentNote = [
                "<li class='list-group-item'>",
                "No notes for this article yet.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        } else {
            // if we do have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                // constructs an list to contain our noteText & delete button
                currentNote = $([
                    "<li class='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                // store the note id on the delete button for easy access when trying to delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                // adding our currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        // append the notesToRender
        $(".note-container").append(notesToRender);
    }
    
    function handleArticleDelete() {
        // handles deleting articles/headlines by grabbing the id of the article to delete from the panel element the delete button sits inside
        var articleToDelete = $(this).parents(".panel").data();
        // using delete method here to be semantic since we are deleting an article/headline
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {
            // if this works, run initPage again which will re-render our list of saved articles
            if (data.ok) {
                initPage();
            }
        });
    }
    
    function handleArticleNotes() {
        // this function  handles appending the notes modal & displaying the notes
        // we get the id of the article to get notes for from the panel element - the delete button sits inside
        var currentArticle = $(this).parents(".panel").data();
        // grab any notes with this headline/article id
        $.get("/api/notes/" + currentArticle._id).then(function(data) {
            // constructing our initial HTML to add to the notes modal
            var modalText = [
                "<div class='container-fluid text-center'>",
                "<h4>Notes For Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class='list-group note-container'>",
                "</ul>",
                "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
                "<button class='btn btn-success save'>Save Note</button>",
                "</div>"
            ].join("");
            // adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            // adding some info about the article & article notes to the save button for easy access when trying to add a new note
            $(".btn.save").data("article", noteData);
            // renderNotesList will populate the actual note HTML inside the modal we just created/opened
            renderNotesList(noteData);
        });
    }

    function handleNoteSave() {
        // function to handle what happens when a user tries to save a new note for an article
        // setting a variable to hold some formatted data about our note & grabbing the note typed into the input box
        var noteData;
        var newNote = $(".bootbox-body textarea").val().trim();
        // if there is data in the note input field, format it & post to the /api/notes route & send the formatted noteData as well
        if (newNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function() {
                // when complete, close the modal
                bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        // handles the deletion of notes by grabbing the id on the note we want to delete
        var noteToDelete = $(this).data("_id");
        // perform a DELETE request to "/api/notes/" with the id of the note we're deleting as a parameter
        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function() {
            // when done, hide the modal
            bootbox.hideAll();
        });
    }
});
