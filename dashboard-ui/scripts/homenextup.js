﻿(function ($, document) {

    function getView() {

        return 'Thumb';
    }

    function getResumeView() {

        return 'Poster';
    }

    function reload(page) {

        Dashboard.showLoadingMsg();

        var context = '';

        if (LibraryMenu.getTopParentId()) {

            $('.scopedLibraryViewNav', page).show();
            $('.globalNav', page).hide();
            $('.scopedContent', page).show();
            context = 'tv';

            loadResume(page);

        } else {
            $('.scopedLibraryViewNav', page).hide();
            $('.globalNav', page).show();
            $('.scopedContent', page).hide();
        }

        loadNextUp(page, context || 'home-nextup');
    }

    function loadNextUp(page, context) {

        var limit = AppInfo.hasLowImageBandwidth ?
         16 :
         24;

        var query = {

            Limit: limit,
            Fields: "PrimaryImageAspectRatio,SeriesInfo,DateCreated,SyncInfo",
            UserId: Dashboard.getCurrentUserId(),
            ExcludeLocationTypes: "Virtual",
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Banner,Thumb"
        };

        query.ParentId = LibraryMenu.getTopParentId();

        ApiClient.getNextUpEpisodes(query).done(function (result) {

            if (result.Items.length) {
                $('.noNextUpItems', page).hide();
            } else {
                $('.noNextUpItems', page).show();
            }

            var view = getView();
            var html = '';

            if (view == 'ThumbCard') {

                html += LibraryBrowser.getPosterViewHtml({
                    items: result.Items,
                    shape: "backdrop",
                    showTitle: true,
                    preferThumb: true,
                    showParentTitle: true,
                    lazy: true,
                    cardLayout: true,
                    context: 'tv',
                    showDetailsMenu: true
                });

            } else if (view == 'Thumb') {

                html += LibraryBrowser.getPosterViewHtml({
                    items: result.Items,
                    shape: "backdrop",
                    showTitle: true,
                    showParentTitle: true,
                    overlayText: false,
                    context: context,
                    lazy: true,
                    preferThumb: true,
                    showDetailsMenu: true
                });
            }

            var elem = page.querySelector('#nextUpItems');
            elem.innerHTML = html;
            ImageLoader.lazyChildren(elem);
            Dashboard.hideLoadingMsg();
        });
    }

    function enableScrollX() {
        return $.browser.mobile && AppInfo.enableAppLayouts;
    }

    function getThumbShape() {
        return enableScrollX() ? 'overflowBackdrop' : 'backdrop';
    }

    function loadResume(page) {

        var parentId = LibraryMenu.getTopParentId();

        var screenWidth = $(window).width();

        var limit = 6;

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            IncludeItemTypes: "Episode",
            Filters: "IsResumable",
            Limit: limit,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio,SeriesInfo,UserData,SyncInfo",
            ExcludeLocationTypes: "Virtual",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Banner,Thumb"
        };

        ApiClient.getItems(Dashboard.getCurrentUserId(), options).done(function (result) {

            if (result.Items.length) {
                $('#resumableSection', page).show();
            } else {
                $('#resumableSection', page).hide();
            }

            var view = getResumeView();
            var html = '';

            if (view == 'PosterCard') {

                html += LibraryBrowser.getPosterViewHtml({
                    items: result.Items,
                    shape: getThumbShape(),
                    showTitle: true,
                    showParentTitle: true,
                    lazy: true,
                    cardLayout: true,
                    context: 'tv',
                    showDetailsMenu: true
                });

            } else if (view == 'Poster') {

                html += LibraryBrowser.getPosterViewHtml({
                    items: result.Items,
                    shape: getThumbShape(),
                    showTitle: true,
                    showParentTitle: true,
                    overlayText: screenWidth >= 800 && !AppInfo.hasLowImageBandwidth,
                    lazy: true,
                    context: 'tv',
                    showDetailsMenu: true
                });
            }

            var elem = page.querySelector('#resumableItems');
            elem.innerHTML = html;
            ImageLoader.lazyChildren(elem);
        });
    }

    $(document).on('pagebeforeshowready', "#homeNextUpPage", function () {

        var page = this;

        if (enableScrollX()) {
            page.querySelector('#resumableItems').classList.add('hiddenScrollX');
        } else {
            page.querySelector('#resumableItems').classList.remove('hiddenScrollX');
        }

        reload(page);
    });


})(jQuery, document);