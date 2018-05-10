// Init
hideShowMoreButton();

// For information on getting an API key for het rijksmuseum, see:
// https://www.rijksmuseum.nl/en/api
rijksmuseum = { apiKey : ''};

$(document).ready(function() {

    $('.showMoreButton').on('click', function(){
        makeRijksmuseumSearch(globalObj.q);
    });

    // Click listener for modal
    $('.card-columns').on('click', 'img.showModal', function(){
        var link = $(this).attr('src');
        $('.img-modal').attr('src',link);
        var description = $(this).next().find('.PlaqueDescription').text() || $(this).next().find('.paintingDescription').text();
        $('.plaque').text(description);

        var title = $(this).next().find('.card-text').text();
        var painter = $(this).next().find('.card-title').text();
        $('.modal-title').text(title + ' by ' + painter);
        $('#largeModal').modal('show');
    });

    // Click listener for form submits
    $(".form").submit(function(e){
        var userSearch = $('#nameSearch').val();
        e.preventDefault();
        clearResults();
        makeRijksmuseumSearch(userSearch);
    });

    // Click listener for artist link on image cards
    $('.container-fluid').on('click','a.clearSearch' , function(){
        var artist = $(this).text();
        clearResults();
        makeRijksmuseumSearch(artist);
        $('#nameSearch').val(artist);
    });

    // Click listener for painting object info
    $('.container-fluid').on('click','button.objInfo' , function(){
        var id = "#" + $(this).attr('data-objId');
        $(id).find('.paintingDescription').toggle("fast");
        $(id).find('.show').toggle();
        $(id).find('.hidden').toggle();
        // makeWikipediaRequest(artist);
    });
});

function clearResults(){
    globalObj.q = "";
    globalObj.page = 1;
    $('.card-columns').empty();
    $('.notFoundMessage').slideUp(300);
}

function hideShowMoreButton(){
    $('.showMoreButton').hide();
}
function showShowMoreButton(){
    $('.showMoreButton').delay(4000).fadeIn(300);
}

// The global object keeps track of pagination for the image returns
var globalObj = {
    page : 1,
    q : ""
};

function makeRijksmuseumSearch(userSearch){

    var page = globalObj.page;
    var q = globalObj.q || userSearch;
    globalObj.q = userSearch;

    $.getJSON({
        type: 'GET',
        url: 'https://www.rijksmuseum.nl/api/nl/collection/',
        data : {
            key : rijksmuseum.apiKey,
            imgonly : true,
            material : 'olieverf',
            type : 'schilderij',
            p : page,
            ps : 10,
            q : q
        },
        success: function (data) {
            if(data.count == 0){
                noResults();
                globalObj.page = 1;
                globalObj.q = "";
                hideShowMoreButton();
            }else{
                if(page * 10 <  data.count){
                    // there are more pages to show, add one to globalObj.page
                    globalObj.page += 1;
                    // Show the Show More button;
                    showShowMoreButton();
                }else{
                    globalObj.page = 1;
                    globalObj.q = "";
                    hideShowMoreButton();
                }
            getImageData(data);
            }
        },
    });
}

// Shows an error message when a succesfull search request returns 0 hits
function noResults(){
    $('.notFoundMessage').find('#searchError').text(globalObj.q);
    $('.notFoundMessage').slideDown(600);
}

function getImageData(data){
    var objectNumbers = [];
    data.artObjects.forEach(function(image){
        objectNumbers.push(image.objectNumber);
    });
    objectNumbers.forEach(function(obj){
        $.getJSON({
            type: 'GET',
            url: 'https://www.rijksmuseum.nl/api/nl/collection/' + obj,
            data : {
                key : rijksmuseum.apiKey,
            },
            success: function (data) {
        // Create an image object with the following data:
                var imageObj = {
                    id : data.artObject.id,
                    description : data.artObject.description,
                    title : data.artObject.title,
                    principleMaker : data.artObject.principalMaker,
                    dating : data.artObject.dating.presentingDate,
                    colors : data.artObject.colorsWithNormalization,
                    imageURL : data.artObject.webImage.url,
                    plaque : data.artObjectPage.plaqueDescription
                };
                appendImages(imageObj);
            },
        });
    });
}

function appendImages(obj){
// colors : data.artObject.colorsWithNormalization
// add colors in card
    var html = "";
    html += '<div class="card" id="'+obj.id+'">';
        html += '<img class="card-img showModal" src="' + obj.imageURL + '">';
        html += '<div class="card-body">';
            html += '<h5 class="card-title">';
                html += '<a href="#" class="clearSearch badge badge-light">'+ obj.principleMaker +'</a>';
                html += '</h5>';
                html += '<p class="card-text">'+ obj.title + ' - ' + obj.dating +'</p>';
                if (obj.plaque){
                    html += '<p class="PlaqueDescription">' + obj.plaque + '</p>';
                }
                html += '<p class="paintingDescription">' + obj.description + '</p>';
            html += '</div>';
        html += '<button type="button" data-objId="'+ obj.id +'"class="btn btn-light objInfo"><span class="show">Show  more</span><span class="hidden">Show less</span></button>';
    html += '</div>';
    $('.card-columns').append($(html).hide().fadeIn(2000));
}
