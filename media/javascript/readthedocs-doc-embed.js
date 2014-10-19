/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
  getItem: function (sKey) {
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    if (!sKey) { return false; }
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};

$(document).ready(function () {

    get_data = {
        project: READTHEDOCS_DATA['project'],
        version: READTHEDOCS_DATA['version'],
        page: READTHEDOCS_DATA['page'],
        theme: READTHEDOCS_DATA['theme'],
        format: "jsonp",
    }

    // Crappy heuristic, but people change the theme name on us.
    // So we have to do some duck typing.
    var USING_RTD_THEME = (READTHEDOCS_DATA['theme'] == 'sphinx_rtd_theme') || $('div.rst-other-versions').length == 1

    if ("docroot" in READTHEDOCS_DATA) {
      get_data['docroot'] = READTHEDOCS_DATA['docroot']
    }

    if ("source_suffix" in READTHEDOCS_DATA) {
      get_data['source_suffix'] = READTHEDOCS_DATA['source_suffix']
    }

    var API_HOST = READTHEDOCS_DATA['api_host']
    if (API_HOST === undefined) {
      API_HOST = 'https://readthedocs.org'
    }

    if (window.location.pathname.indexOf('/projects/') == 0) {
      get_data['subproject'] = true
    }

    // Theme popout code
    $.ajax({
      url: API_HOST + "/api/v2/footer_html/",
      crossDomain: true,
      xhrFields: {
        withCredentials: true,
      },
      dataType: "jsonp",
      data: get_data,
      success: function (data) {
            // If the theme looks like ours, update the existing badge
            // otherwise throw a a full one into the page.
            if (USING_RTD_THEME) {
              $("div.rst-other-versions").html(data['html'])
            } else {
              $("body").append(data['html'])
            }

            if (!data['version_active']) {
                $('.rst-current-version').addClass('rst-out-of-date')
            } else if (!data['version_supported']) {
                //$('.rst-current-version').addClass('rst-active-old-version')
            }

            /// Read the Docs theme code
            if (docCookies.hasItem('menu')) {
              menu_cookie = docCookies.getItem('menu')
              if (menu_cookie == 'open') {
                $("[data-toggle='rst-versions']").addClass("shift-up");
              }
            }
      },
      error: function () {
          console.log('Error loading Read the Docs footer')
      }
    });

    /// Read the Docs theme code

    // Shift nav in mobile when clicking the menu.
    $(document).on('click', "[data-toggle='wy-nav-top']", function() {
      $("[data-toggle='wy-nav-shift']").toggleClass("shift");
      $("[data-toggle='rst-versions']").toggleClass("shift");
    });
    // Close menu when you click a link.
    $(document).on('click', ".wy-menu-vertical .current ul li a", function() {
      $("[data-toggle='wy-nav-shift']").removeClass("shift");
      $("[data-toggle='rst-versions']").toggleClass("shift");
    });
    $(document).on('click', "[data-toggle='rst-current-version']", function() {
      $("[data-toggle='rst-versions']").toggleClass("shift-up");
      if (docCookies.hasItem('menu')) {
        menu_cookie = docCookies.getItem('menu')
        if (menu_cookie == 'open') {
          docCookies.setItem('menu', 'close')
        } else {
          docCookies.setItem('menu', 'open')
        }
      } else {
          docCookies.setItem('menu', 'open')
        }
    });
    // Make tables responsive
    $("table.docutils:not(.field-list)").wrap("<div class='wy-table-responsive'></div>");

    window.SphinxRtdTheme = (function (jquery) {
        var stickyNav = (function () {
            var navBar,
                win,
                stickyNavCssClass = 'stickynav',
                applyStickNav = function () {
                    if (navBar.height() <= win.height()) {
                        navBar.addClass(stickyNavCssClass);
                    } else {
                        navBar.removeClass(stickyNavCssClass);
                    }
                },
                enable = function () {
                    init();
                    applyStickNav();
                    win.on('resize', applyStickNav);
                },
                init = function () {
                    navBar = jquery('nav.wy-nav-side:first');
                    win    = jquery(window);
                };
            jquery(init);
            return {
                enable : enable
            };
        }());
        return {
            StickyNav : stickyNav
        };
    }($));


    /// Add Grok the Docs Client

    /*
    $.ajax({
        url: "https://api.grokthedocs.com/static/javascript/bundle-client.js",
        crossDomain: true,
        dataType: "script",
    });
    */


    /// Out of date message

      var versionURL = [API_HOST + "/api/v1/version/", READTHEDOCS_DATA['project'],
                        "/highest/", READTHEDOCS_DATA['version'], "/?callback=?"].join("");

      $.getJSON(versionURL, onData);

      function onData (data) {
        if (data.is_highest) {
          return;
        }

        var currentURL = window.location.pathname.replace(READTHEDOCS_DATA['version'], data.slug),
            warning = $('<div class="admonition warning"> <p class="first \
                         admonition-title">Note</p> <p class="last"> \
                         You are not using the most up to date version \
                         of the library. <a href="#"></a> is the newest version.</p>\
                         </div>');

        warning
          .find('a')
          .attr('href', currentURL)
          .text(data.version);

        body = $("div.body")
        if (!body.length) {
          body = $("div.document")
        }
        body.prepend(warning);
      }


    // Hijack search on mkdocs
    if ("builder" in READTHEDOCS_DATA && READTHEDOCS_DATA["builder"] == "mkdocs") {
      $('<input>').attr({
          type: 'hidden',
          name: 'project',
          value: READTHEDOCS_DATA["project"]
      }).appendTo('#rtd-search-form');
      $('<input>').attr({
          type: 'hidden',
          name: 'version',
          value: READTHEDOCS_DATA["version"]
      }).appendTo('#rtd-search-form');
      $('<input>').attr({
          type: 'hidden',
          name: 'type',
          value: 'file'
      }).appendTo('#rtd-search-form');

      $("#rtd-search-form").prop("action", API_HOST + "/elasticsearch/")
    }


    /// Search
    /// Here be dragons, this is beta quality code. Beware.

    if (USING_RTD_THEME) {
      searchLanding()
    }

    $(document).on({
      mouseenter: function(ev) {
          var tooltip = $(ev.target).next()
          tooltip.show()
      },
      mouseleave: function(ev) {
          var tooltip = $(ev.target).next()
          tooltip.hide()
      }
    }, '.result-count')

    $(document).on('submit', '#rtd-search-form', function (ev) {
      //ev.preventDefault();
      clearSearch()
      var query = $("#rtd-search-form input[name='q']").val()
      getSearch(query, true)
    })

    $(document).on('click', '.search-result', function (ev) {
      ev.preventDefault();
      //console.log(ev.target)
      html = $(ev.target).next().html()
      displayContent(html);
    })

    function searchLanding() {
      // Highlight based on highlight GET arg
      var params = $.getQueryParameters();
      var query = (params.q) ? params.q[0].split(/\s+/) : [];
      var clear = true
      /* Don't "search" on highlight phrases
      if (!query.length) {
        // Only clear on q
        clear = false
        var query = (params.highlight) ? params.highlight[0].split(/\s+/) : [];
      }
      */
      if (query.length) {
        query = query.join(" ")
        console.log("Searching based on GET arg for: " + query)
        $("#rtd-search-form input[name='q']").val(query)
        getSearch(query, clear)
      }
    }

    function getSearch(query, clear) {
      var get_data = {
        project: READTHEDOCS_DATA['project'],
        version: READTHEDOCS_DATA['version'],
        format: "jsonp",
        q: query
      }

      // Search results
      $.ajax({
        url: API_HOST + "/api/v2/search/section/",
        crossDomain: true,
        xhrFields: {
          withCredentials: true,
        },
        dataType: "jsonp",
        data: get_data,
        success: function (data) {
          clearSearch(clear)
          hits = data.results.hits.hits
          if (!hits.length) {
            resetState()
          } else {
            displaySearch(hits, query)
          }
        },
        error: function () {
            console.log('Error searching')
        }
      });
    }

    function displayContent(html) {
        var content = $('.rst-content')
        content.html(html)
    }

    function displaySearch(hits, query) {
      FIRSTRUN = {}
      current = $(".toctree-l1.current > a")
      for (index in hits) {
        var hit = hits[index]
        var path = hit.fields.path
        var pageId = hit.fields.page_id
        var title = hit.fields.title
        var content = hit.fields.content
        var highlight = hit.highlight.content
        var score = hit._score

        var li = $(".toctree-l1 > a[href^='" + path + "']")

        /*
        // This doesn't work :)
        if (!li.length && $(current.next().children()[0]).text() == title) {
            li = current
            console.log("Current page: " + title)
        } else {
          console.log("Not: " + title)
        }
        */

        var ul = li.next()

        console.log(path)

        // Display content for first result
        if (index == 0) {
          // Don't display content for now, so we show sphinx results
          //displayContent(content)
        }

        // Clear out subheading with result content
        if (!FIRSTRUN[path]) {
          li.show()
          li.attr("href", li.attr('href') + "?highlight=" + query)
          li.parent().addClass("current")
          li.append("<i style='position:absolute;right:30px;top:6px;' class='fa fa-search result-icon'></i>")
          ul.empty()
          FIRSTRUN[path] = true
        }

        // Dedupe
        if (!FIRSTRUN[path+title]) {
          ul.append('<li class="toctree-l2">' + '<a class="reference internal search-result" pageId="' + pageId + '">' + title + '</a>' + '<span style="display: none;" class="data">' + content + '</span>' + '</li>')
          if (score > 1) {
            $(".toctree-l2 ")
            inserted = $('.toctree-l2 > [pageId="' + pageId + '"]')
            inserted.append("<i style='position:absolute;right:30px;top:6px;' class='fa fa-fire'></i>")
          }
          FIRSTRUN[path+title] = true
        }
      }
      // Hide non-showing bits
      $.each($(".toctree-l1 > a"), function (index, el) {
          hide = true
          if ($(el).attr('href') == "") {
              // Current page
              hide = false
          }
          for (key in FIRSTRUN) {
              if ($(el).attr('href').indexOf(key) == 0) {
                hide = false
              }
          }
          if (hide) {
            //console.log("Hiding " + el)
            $(el).hide()
          }

      })

    }

    function resetState() {
      $.each($(".toctree-l1 > a"), function (index, el) {
        var el = $(el)
        el.show()
        el.parent().show()
      })

    }
    function clearSearch(empty) {
      $('.result-icon').remove()
      $.each($(".toctree-l1 > a"), function (index, el) {
        var el = $(el)
        if (empty) {
          //console.log('Clearing ' + el.next())
          el.parent().removeClass('current')
          el.next().empty()
        }
      })
    }

})
