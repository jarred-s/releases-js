'use strict';
//https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc

angular.module('app.shared')
    .factory('Movie', function ($http, OmdbService) {

        /**
         * Constructor
         */
        function Movie(releaseName) {
            this.releaseName = releaseName;

            // Extract info from the release name, eg
            // American Heist 2014 DVDRip x264-EXViD
            var regexResult = /(^|.*)( \d{4} )(.*)-(.*|$)/.exec(releaseName);
            if (regexResult && regexResult.length == 5)
            {
                // Movie info
                this.title = regexResult[1].trim();
                this.year = regexResult[2].trim();

                // Release info
                var extraInfo = regexResult[3].replace('LIMITED', '').trim().split(' ');
                this.quality = extraInfo.length >= 3 ? extraInfo[extraInfo.length - 3] : '';
                this.source = extraInfo.length >= 2 ? extraInfo[extraInfo.length - 2] : '';
                this.encoding = extraInfo.length >= 1 ? extraInfo[extraInfo.length - 1] : '';
                this.releaseGroup = regexResult[4];
            }
            else
                this.title = releaseName;

            // Lookup movie meta data
            OmdbService.populateMovie(this);
        }

        /**
         * Public methods
         */
        Movie.prototype.getQuality = function () {
            return !angular.isNullOrWhitespace(this.quality) ? this.quality : this.source;
        };

        Movie.prototype.getImdbRating = function () {
            return !angular.isNullOrWhitespace(this.imdbRating) ? this.imdbRating : '-';
        };

        Movie.prototype.getTomatoMeter = function () {
            return !angular.isNullOrWhitespace(this.tomatoMeter) ? this.tomatoMeter : '-';
        };

        Movie.prototype.getImdbStyle = function () {
            return ratingToStyle(this.imdbRating, 10);
        };

        Movie.prototype.getTomatoStyle = function () {
            return ratingToStyle(this.tomatoMeter);
        };

        Movie.prototype.getImdbLink = function () {
            return 'http://www.imdb.com/title/' + this.imdbId + '/';
        };

        Movie.prototype.getPosterTooltip = function () {
            var tooltip = '';

            if (!angular.isNullOrWhitespace(this.tomatoMeter))
                tooltip += '<p>RT: ' + this.tomatoMeter + '% - ' + this.tomatoReviews + ' critics</p>';

            if (!angular.isNullOrWhitespace(this.imdbRating))
                tooltip += '<p>IMDb: ' + this.imdbRating + ' - ' + this.imdbVotes + ' viewers</p>';

            if (!angular.isNullOrWhitespace(this.tomatoConsensus))
                tooltip += '<p>' + this.tomatoConsensus + '</p>';

            return tooltip;
        };

        /**
         * Private functions
         */
        function ratingToStyle(rating, multiplier) {
            multiplier = typeof multiplier !== 'undefined' ? multiplier : 1;

            if (angular.isNullOrWhitespace(rating))
                return 'rating-red';

            rating = parseInt(rating) * multiplier;

            if (rating >= 70)
                return 'rating-green';
            if (rating >= 50)
                return 'rating-orange';

            return 'rating-red';
        }

        /**
         * Private property
         */
        var possibleRoles = ['admin', 'editor', 'guest'];

        function checkRole(role) {
            return possibleRoles.indexOf(role) !== -1;
        }

        /**
         * Static property
         */
        Movie.possibleRoles = angular.copy(possibleRoles);

        /**a
         * Static method
         */
        Movie.build = function (data) {
            return new Movie(
                data.release_name
            );
        };

        /**
         * Return the constructor function
         */
        return Movie;
    })
;