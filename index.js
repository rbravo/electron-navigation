/**
 * @author      Jeremy England
 * @license     MIT
 * @description Adds tabs, views, and controls to specified containers in node.js electron.
 * @requires    electron, jquery, color.js
 * @see         https://github.com/simply-coded/electron-navigation
 * @tutorial
 *  Add these IDs to your html (containers don't have to be divs).
 *      <div id='nav-body-ctrls'></div>
 *      <div id='nav-body-tabs'></div>
 *      <div id='nav-body-views'></div>
 *  Add these scripts to your html (at the end of the body tag).
 *      <script>
 *          const enav = new (require('electron-navigation'))()
 *      </script>
 *  Add a theme file to your html (at the end of the head tag)(optional).
 *      <link rel="stylesheet" type="text/css" href="location/of/theme.css">
 */
/**
 * DEPENDENCIES
 */
var $ = require('jquery');
var Color = require('color.js');
var urlRegex = require('url-regex');
const contextMenu = require('electron-context-menu')
const https = require('https');
const urlLib = require('url')
var globalCloseableTabsOverride;
/**
 * OBJECT
 */
function Navigation(options) {
    /**
     * OPTIONS
     */
    var defaults = {
        showBackButton: true,
        showForwardButton: true,
        showReloadButton: true,
        showUrlBar: true,
        showAddTabButton: true,
        closableTabs: true,
        verticalTabs: false,
        defaultFavicons: false
    };
    if (options === 'undefined' || options === 'null' || options !== Object(options)) {
        options = {};
    }
    for (var key in defaults) {
    if (!(key in options)) {
            options[key] = defaults[key];
        }
    }
    /**
     * GLOBALS & ICONS
     */
    globalCloseableTabsOverride = options.closableTabs;
    const NAV = this;
    this.SESSION_ID = 1;
    if (options.defaultFavicons) {
        this.TAB_ICON = "default";
    } else {
        this.TAB_ICON = "clean";
    }

    this.SVG_BACK = '<svg height="100%" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
    this.SVG_FORWARD = '<svg height="100%" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';
    this.SVG_RELOAD = '<svg height="100%" viewBox="0 0 24 24" id="nav-ready"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
    this.SVG_FAVICON = '<svg height="100%" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
    this.SVG_ADD = '<svg height="100%" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>';
    this.SVG_CLEAR = '<svg height="100%" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
    this.INITIAL_TAB_ICON = options.initialTabIcon || '';
    /**
     * ADD ELEMENTS
     */
    if (options.showBackButton) {
        $('#nav-body-ctrls').append('<i id="nav-ctrls-back" class="nav-icons disabled" title="Go back">' + this.SVG_BACK + '</i>');
    }
    if (options.showForwardButton) {
        $('#nav-body-ctrls').append('<i id="nav-ctrls-forward" class="nav-icons disabled" title="Go forward">' + this.SVG_FORWARD + '</i>');
    }
    if (options.showReloadButton) {
        $('#nav-body-ctrls').append('<i id="nav-ctrls-reload" class="nav-icons disabled" title="Reload page">' + this.SVG_RELOAD + '</i>');
    }
    if (options.showUrlBar) {
        $('#nav-body-ctrls').append('<input id="nav-ctrls-url" type="text" title="Enter an address or search term" ' + (options.readonly ? 'readonly' : '') + '/>')
    }
    if (options.showAddTabButton) {
        $('#nav-body-tabs').append('<i id="nav-tabs-add" class="nav-icons" title="Add new tab">' + this.SVG_ADD + '</i>');
    }
    /**
     * ADD CORE STYLE
     */
    if (options.verticalTabs) {
        $('head').append('<style id="nav-core-styles">#nav-body-ctrls,#nav-body-tabs,#nav-body-views,.nav-tabs-tab{display:flex;align-items:center;}#nav-body-tabs{overflow:auto;min-height:32px;flex-direction:column;}#nav-ctrls-url{box-sizing:border-box;}.nav-tabs-tab{min-width:60px;width:100%;min-height:20px;}.nav-icons{fill:#000;width:24px;height:24px}.nav-icons.disabled{pointer-events:none;opacity:.5}#nav-ctrls-url{flex:1;height:24px}.nav-views-view{flex:0 1;width:0;height:0}.nav-views-view.active{flex:1;width:100%;height:100%}.nav-tabs-favicon{align-content:flex-start}.nav-tabs-title{flex:1;cursor:default;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nav-tabs-close{align-content:flex-end}@keyframes nav-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>');
    } else {
        $('head').append('<style id="nav-core-styles">#nav-body-ctrls,#nav-body-tabs,#nav-body-views,.nav-tabs-tab{display:flex;align-items:center}#nav-body-tabs{overflow:auto;min-height:32px;}#nav-ctrls-url{box-sizing:border-box;}.nav-tabs-tab{min-width:60px;width:180px;min-height:20px;}.nav-icons{fill:#000;width:24px;height:24px}.nav-icons.disabled{pointer-events:none;opacity:.5}#nav-ctrls-url{flex:1;height:24px}.nav-views-view{flex:0 1;width:0;height:0}.nav-views-view.active{flex:1;width:100%;height:100%}.nav-tabs-favicon{align-content:flex-start}.nav-tabs-title{flex:1;cursor:default;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nav-tabs-close{align-content:flex-end}@keyframes nav-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>');
    }
    /**
     * EVENTS
     */
    //
    // switch active view and tab on click
    //
    $('#nav-body-tabs').on('click', '.nav-tabs-tab', function () {
        $('.nav-tabs-tab, .nav-views-view').removeClass('active');

        var sessionID = $(this).data('session');
        $('.nav-tabs-tab, .nav-views-view')
            .filter('[data-session="' + sessionID + '"]')
            .addClass('active');

        var session = $('.nav-views-view[data-session="' + sessionID + '"]')[0];
        NAV._updateUrl(session.getURL());
        NAV._updateCtrls();
        // get options
        var opts = JSON.parse(decodeURIComponent($(session).attr('data-options-json')));
        // is readonly tab?
        if (opts.readonly)
            $('#nav-ctrls-url').attr('readonly', 'readonly')
        else
            $('#nav-ctrls-url').removeAttr('readonly')
        // listener for when tabs are activated
        if (NAV.onActivateTab) NAV.onActivateTab(session, opts);

        //
        // close tab and view
        //
    }).on('click', '.nav-tabs-close', function () {
        var sessionID = $(this).parent('.nav-tabs-tab').data('session');
        var session = $('.nav-tabs-tab, .nav-views-view').filter('[data-session="' + sessionID + '"]');

        if (session.hasClass('active')) {
            if (session.next('.nav-tabs-tab').length) {
                session.next().addClass('active');
            } else {
                session.prev().addClass('active');
            }
        }
        session.remove();
        NAV._updateUrl();
        NAV._updateCtrls();
        return false;
    });
    //
    // add a tab, default to google.com
    //
    $('#nav-body-tabs').on('click', '#nav-tabs-add', function () {
        NAV.newTab(NAV.navDefaultURL || 'http://www.google.com/', {
            close: options.closableTabs,
            icon: NAV.TAB_ICON, 
            webPreferences: {
                webSecurity: false
            }
        });
    });
    //
    // go back
    //
    $('#nav-body-ctrls').on('click', '#nav-ctrls-back', function () {
        NAV.back();
    });
    //
    // go forward
    //
    $('#nav-body-ctrls').on('click', '#nav-ctrls-forward', function () {
        NAV.forward();
    });
    //
    // reload page
    //
    $('#nav-body-ctrls').on('click', '#nav-ctrls-reload', function () {
        if ($(this).find('#nav-ready').length) {
            NAV.reload();
        } else {
            NAV.stop();
        }
    });
    //
    // highlight address input text on first select
    //
    $('#nav-ctrls-url').on('focus', function (e) {
        $(this)
            .one('mouseup', function () {
                $(this).select();
                return false;
            })
            .select();
    });
    //
    // load or search address on enter / shift+enter
    //
    $('#nav-ctrls-url').keyup(function (e) {
        if (e.keyCode == 13) {
            if (e.shiftKey) {
                NAV.newTab(this.value, {
                    close: options.closableTabs,
                    icon: NAV.TAB_ICON
                });
            } else {
                if ($('.nav-tabs-tab').length) {
                    NAV.changeTab(this.value);
                } else {
                    NAV.newTab(this.value, {
                        close: options.closableTabs,
                        icon: NAV.TAB_ICON
                    });
                }
            }
        }
    });
    /**
     * FUNCTIONS
     */
    //
    // update back and forward buttons
    //
    this._updateCtrls = function () {
        webview = $('.nav-views-view.active')[0];
        if (!webview) {
            $('#nav-ctrls-back').addClass('disabled');
            $('#nav-ctrls-forward').addClass('disabled');
            $('#nav-ctrls-reload').html(this.SVG_RELOAD).addClass('disabled');
            return;
        }
        if (webview.canGoBack()) {
            $('#nav-ctrls-back').removeClass('disabled');
        } else {
            $('#nav-ctrls-back').addClass('disabled');
        }
        if (webview.canGoForward()) {
            $('#nav-ctrls-forward').removeClass('disabled');
        } else {
            $('#nav-ctrls-forward').addClass('disabled');
        }
        if (webview.isLoading()) {
          this._loading();
        } else {
          this._stopLoading();
        }
    } //:_updateCtrls()
    //
    // start loading animations
    //
    this._loading = function (tab) {
        tab = tab || null;

        if (tab == null) {
          tab = $('.nav-tabs-tab.active');
        }

        tab.find('.nav-tabs-favicon').css('animation', 'nav-spin 2s linear infinite');
        $('#nav-ctrls-reload').html(this.SVG_CLEAR);
    } //:_loading()
    //
    // stop loading animations
    //
    this._stopLoading = function (tab) {
        tab = tab || null;

        if (tab == null) {
          tab = $('.nav-tabs-tab.active');
        }

        tab.find('.nav-tabs-favicon').css('animation', '');
        $('#nav-ctrls-reload').html(this.SVG_RELOAD);
    } //:_stopLoading()
    //
    // auto add http protocol to url input or do a search
    //
    this._purifyUrl = function (url) {
        if(urlRegex({ strict: false, exact: true }).test(url)) {
            url = (url.match(/^https?:\/\/.*/)) ? url : 'http://' + url;
        } else {
            url = (!url.match(/^[a-zA-Z]+:\/\//)) ? 'https://www.google.com/search?q=' + url.replace(' ', '+') : url;
        }
        return url;
    } //:_purifyUrl()
    //
    // set the color of the tab based on the favicon
    //
    this._setTabColor = function (url, currtab) {
        const getHexColor = new Color(url, {
            amount: 1,
            format: 'hex'
        });
        getHexColor.mostUsed(result => {
            currtab.find('.nav-tabs-favicon svg').attr('fill', result);
        });
    } //:_setTabColor()
    //
    // add event listeners to current webview
    //
    this._addEvents = function (sessionID, favicon, title) {
        var currtab = $('.nav-tabs-tab[data-session="' + sessionID + '"]');
        var webview = $('.nav-views-view[data-session="' + sessionID + '"]');

        webview.on('page-title-updated', function () {
            if (title == 'default') {
                currtab.find('.nav-tabs-title').text(webview[0].getTitle());
                currtab.find('.nav-tabs-title').attr('title', webview[0].getTitle());
            }
        });
        webview.on('did-start-loading', function () {
            NAV._loading(currtab);
        });
        webview.on('did-stop-loading', function () {
            NAV._stopLoading(currtab);
        });
        webview.on('enter-html-full-screen', function () {
            $('.nav-views-view.active').siblings().not('script').hide();
            $('.nav-views-view.active').parents().not('script').siblings().hide();
        });
        webview.on('leave-html-full-screen', function () {
            $('.nav-views-view.active').siblings().not('script').show();
            $('.nav-views-view.active').parents().siblings().not('script').show();
        });
        webview.on('load-commit', function () {
            NAV._updateCtrls();
        });
        // webview[0].addEventListener('certificate-error', (ev, wc, url, error) => {
        //     console.log("< certificate error: ", ev,wc,url,error);
        // });
        webview[0].addEventListener('did-navigate', function (res) {
          NAV._updateUrl(res.url);
          //NAV._validateCertificate(res.url);          
        });
        webview[0].addEventListener('did-fail-load', function (res) {
          NAV._updateUrl(res.validatedUrl);
        });
        webview[0].addEventListener('did-navigate-in-page', function (res) {
          NAV._updateUrl(res.url);
        });
        webview[0].addEventListener('new-window', (res) => {
            NAV.newTab(res.url, {
                icon: NAV.TAB_ICON
            });
        });
        webview[0].addEventListener('page-favicon-updated', (res) => {
            if (favicon == 'clean') {
                NAV._setTabColor(res.favicons[0], currtab);
            } else if (favicon == 'default') {
                currtab.find('.nav-tabs-favicon').attr('src', res.favicons[0]);
            }
        });
        webview[0].addEventListener('did-fail-load', function (res) {
            if (res.validatedURL == $('#nav-ctrls-url').val() && res.errorCode != -3) {
                this.executeJavaScript("document.body.innerHTML='" +
                    '<div style="background-color:whitesmoke;padding:40px;margin:20px;font-family:consolas;border-radius:10px; background: #fff;border-radius: 3px;box-shadow: 0 1px 2px rgba(0,0,0,0.07);">' +
                    '<h1 align=center>=(</h1>' +
                    '<h2 align=center>Oops, this page failed to load correctly.</h2>' +
                    //'<div><img class="thumbnail" src="data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjQxMDRCQ0U1NEYzNDExRThCNUFBQTUzQzQ5QTI5Q0M3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjQxMDRCQ0U2NEYzNDExRThCNUFBQTUzQzQ5QTI5Q0M3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDEwNEJDRTM0RjM0MTFFOEI1QUFBNTNDNDlBMjlDQzciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NDEwNEJDRTQ0RjM0MTFFOEI1QUFBNTNDNDlBMjlDQzciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYG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"></div>'+
                    '<p align=center style=\"color:red\"><i>ERROR [ ' + res.errorCode + ', ' + res.errorDescription + ' ]</i></p>' +
                    '<br/><hr/>' +
                    '<h4>Try this</h4>' +
                    '<li type=circle>Check your spelling - <b>"' + res.validatedURL + '".</b></li><br/>' +
                    '<li type=circle><a href="javascript:location.reload();">Refresh</a> the page.</li><br/>' +
                    '<li type=circle>Perform a <a href=javascript:location.href="https://www.google.com/search?q=' + res.validatedURL + '">search</a> instead.</li><br/>' +
                    '</div>' + "'; document.body.style.backgroundColor='#f4f4f4';"
                );
            }
        });
        return webview[0];
    } //:_addEvents()
    //
    // update #nav-ctrls-url to given url or active tab's url
    //
    this._updateUrl = function (url) {
      url = url || null;
      $ctrlsUrl = $('#nav-ctrls-url');

      if (url == null) {
        if ($('.nav-views-view').length) {
          url = $('.nav-views-view.active')[0].getURL();
        } else {
          url = '';
        }
      }

      $ctrlsUrl.off('blur');

      if (!$ctrlsUrl.is(':focus')) {
        $ctrlsUrl.prop('value', url);
        $ctrlsUrl.data('last', url);
      } else {
        $ctrlsUrl.on('blur', function () {
          urlNotEdited = $ctrlsUrl.val() == $ctrlsUrl.data('last');

          if (urlNotEdited) {
            $ctrlsUrl.prop('value', url);
            $ctrlsUrl.data('last', url);
          }

          $ctrlsUrl.off('blur');
        });
      }
    } //:_updateUrl()

    this._validateCertificate = function(url){
        url = urlLib.parse(url).hostname;
        //url = url.replace('http://','').replace('https://','').split('/')[0];
        var options = {
            hostname: url, 
            agent: false, 
            ciphers: "ALL",
            rejectUnauthorized: true,
            requestCert: true,
        };    
        
        new Promise(function (resolve, reject) { 
            https.get(options, function (res) {
                var certificate = res.socket.getPeerCertificate();
                if(typeof (certificate) === 'undefined' || certificate === null) {
                    reject({message: 'The website did not provide a certificate'});
                } else {
                    resolve(certificate);
                }
            });
        }).then(function(certificate) {
            console.log(certificate)
        });
    }
} //:Navigation()
/**
 * PROTOTYPES
 */
//
// create a new tab and view with an url and optional id
//
Navigation.prototype.newTab = function (url, options) {
    var defaults = {
        id: null, // null, 'custom'
        node: false, // true, false
        webviewAttributes: {},
        icon: "clean", // 'default', 'clean', 'c:\custom.png'
        title: "default", // 'default', 'custom'
        close: true, // true, false        
        readonly: false,
        contextMenu: true
    }
    if (options === 'undefined' || options === 'null' || options !== Object(options)) {
        options = {};
    }
    for (var key in defaults) {
        if (!(key in options)) {
            options[key] = defaults[key];
        }
    }
    // validate options.id
    $('.nav-tabs-tab, .nav-views-view').removeClass('active');
    if ($('#' + options.id).length) {
        console.log('ERROR[electron-navigation][func "newTab();"]: The ID "' + options.id + '" already exists. Please use another one.');
        return false;
    }
    if (!(/^[A-Za-z]+[\w\-\:\.]*$/.test(options.id))) {
        console.log('ERROR[electron-navigation][func "newTab();"]: The ID "' + options.id + '" is not valid. Please use another one.');
        return false;
    }
    // build tab
    var tab = '<span class="nav-tabs-tab active" data-session="' + this.SESSION_ID + '">';
    // favicon
    if (options.icon == 'clean') {
        tab += '<i class="nav-tabs-favicon nav-icons">' + this.SVG_FAVICON + '</i>';
    } else if (options.icon === 'default') {
        tab += '<img class="nav-tabs-favicon nav-icons" src="'+this.INITIAL_TAB_ICON+'"/>';
    } else {
        tab += '<img class="nav-tabs-favicon nav-icons" src="' + options.icon + '"/>';
    }
    // title
    if (options.title == 'default') {
        tab += '<i class="nav-tabs-title">'+options.title+'</i>';
    } else {
        tab += '<i class="nav-tabs-title">' + options.title + '</i>';
    }
    // close
    if (options.close && globalCloseableTabsOverride) {
        tab += '<i class="nav-tabs-close nav-icons">' + this.SVG_CLEAR + '</i>';
    }
    // finish tab
    tab += '</span>';
    // add tab to correct position
    if ($('#nav-body-tabs').has('#nav-tabs-add').length) {
        $('#nav-tabs-add').before(tab);
    } else {
        $('#nav-body-tabs').append(tab);
    }
    // add webview
    var webV = $(`<webview ${options.id ? 'id="' + options.id + '"' : ''} class="nav-views-view active" 
    data-session="${this.SESSION_ID}" src="${this._purifyUrl(url)}" ${options.node ? 'nodeintegration' : ''}
    ${options.node ? 'nodeintegration' : ''}
    data-options-json="${encodeURIComponent(JSON.stringify(options))}"
    ${options.allowpopups ? 'allowpopups' : ''} 
    ${options.disableSecurity ? 'webpreferences="allowRunningInsecureContent" disablewebsecurity' : ''} 
    ></webview>`);
    $('#nav-body-views').append(webV);
    // url text input read only?
    if (options.readonly)
        $('#nav-ctrls-url').attr('readonly', 'readonly')
    else
        $('#nav-ctrls-url').removeAttr('readonly')
   
    // id
    // let composedWebviewTag = `<webview class="nav-views-view active" data-session="${this.SESSION_ID}" src="${this._purifyUrl(url)}"`;
    // if(options.id){
    //     composedWebviewTag += ` id=${options.id}`;
    // }
    // if(options.node){
    //     composedWebviewTag += " nodeintegration";
    // }
    // if (options.webviewAttributes) {
    //     Object.keys(options.webviewAttributes).forEach((key) => {
    //         composedWebviewTag += ` ${key}="${options.webviewAttributes[key]}"`;
    //     });
    // }
    // }
    // $('#nav-body-views').append(`${composedWebviewTag}></webview>`);

    // enable reload button
    $('#nav-ctrls-reload').removeClass('disabled');
    // add context menu
    if (options.contextMenu) {
        var webVRaw = webV[0];
        webVRaw.addEventListener("dom-ready", function () {
            console.log("DOM-Ready, triggering events !");
            webVRaw.send("request");
            contextMenu({
                window: webVRaw,
                // prepend: (params, browserWindow) => [{
                //     //label: 'Rainbow',
                //     // Only show it when right-clicking images
                //     //visible: params.mediaType === 'image'
                // }],
                labels: {
                    cut: 'Cut',
                    copy: 'Copy',
                    paste: 'Paste',
                    save: 'Save',
                    copyLink: 'Copy Link',
                    inspect: 'Inspect'
                }
            });
        });
    }
    this._updateUrl(this._purifyUrl(url));
    return this._addEvents(this.SESSION_ID++, options.icon, options.title);
} //:newTab()
//
// change current or specified tab and view
//
Navigation.prototype.changeTab = function (url, id) {
    id = id || null;
    if (id == null) {
        $('.nav-views-view.active').attr('src', this._purifyUrl(url));
    } else {
        if ($('#' + id).length) {
            $('#' + id).attr('src', this._purifyUrl(url));
        } else {
            console.log('ERROR[electron-navigation][func "changeTab();"]: Cannot find the ID "' + id + '"');
        }
    }
} //:changeTab()
//
// close current or specified tab and view
//
Navigation.prototype.closeTab = function (id) {
    id = id || null;

    var session;
    if (id == null) {
        session = $('.nav-tabs-tab.active, .nav-views-view.active');
    } else {
        if ($('#' + id).length) {
            var sessionID = $('#' + id).data('session');
            session = $('.nav-tabs-tab, .nav-views-view').filter('[data-session="' + sessionID + '"]');
        } else {
            console.log('ERROR[electron-navigation][func "closeTab();"]: Cannot find the ID "' + id + '"');
            return false;
        }
    }

    if (session.next('.nav-tabs-tab').length) {
        session.next().addClass('active');
    } else {
        session.prev().addClass('active');
    }

    session.remove();
    this._updateUrl();
    this._updateCtrls();
} //:closeTab()
//
// go back on current or specified view
//
Navigation.prototype.back = function (id) {
    id = id || null;
    if (id == null) {
        $('.nav-views-view.active')[0].goBack();
    } else {
        if ($('#' + id).length) {
            $('#' + id)[0].goBack();
        } else {
            console.log('ERROR[electron-navigation][func "back();"]: Cannot find the ID "' + id + '"');
        }
    }
} //:back()
//
// go forward on current or specified view
//
Navigation.prototype.forward = function (id) {
    id = id || null;
    if (id == null) {
        $('.nav-views-view.active')[0].goForward();
    } else {
        if ($('#' + id).length) {
            $('#' + id)[0].goForward();
        } else {
            console.log('ERROR[electron-navigation][func "forward();"]: Cannot find the ID "' + id + '"');
        }
    }
} //:forward()
//
// reload current or specified view
//
Navigation.prototype.reload = function (id) {
    id = id || null;
    if (id == null) {
        $('.nav-views-view.active')[0].reload();
    } else {
        if ($('#' + id).length) {
            $('#' + id)[0].reload();
        } else {
            console.log('ERROR[electron-navigation][func "reload();"]: Cannot find the ID "' + id + '"');
        }
    }
} //:reload()
//
// stop loading current or specified view
//
Navigation.prototype.stop = function (id) {
    id = id || null;
    if (id == null) {
        $('.nav-views-view.active')[0].stop();
    } else {
        if ($('#' + id).length) {
            $('#' + id)[0].stop();
        } else {
            console.log('ERROR[electron-navigation][func "stop();"]: Cannot find the ID "' + id + '"');
        }
    }
} //:stop()
//
// listen for a message from webview
//
Navigation.prototype.listen = function (id, callback) {
    let webview = null;

    //check id
    if ($('#' + id).length) {
        webview = document.getElementById(id);
    } else {
        console.log('ERROR[electron-navigation][func "listen();"]: Cannot find the ID "' + id + '"');
    }

    // listen for message
    if (webview != null) {
        try {
            webview.addEventListener('ipc-message', (event) => {
                callback(event.channel, event.args, webview);
            });
        } catch (e) {
            webview.addEventListener("dom-ready", function (event) {
                webview.addEventListener('ipc-message', (event) => {
                    callback(event.channel, event.args, webview);
                });
            });
        }
    }
} //:listen()
//
// send message to webview
//
Navigation.prototype.send = function (id, channel, args) {
    let webview = null;

    // check id
    if ($('#' + id).length) {
        webview = document.getElementById(id);
    } else {
        console.log('ERROR[electron-navigation][func "send();"]: Cannot find the ID "' + id + '"');
    }

    // send a message
    if (webview != null) {
        try {
            webview.send(channel, args);
        } catch (e) {
            webview.addEventListener("dom-ready", function (event) {
                webview.send(channel, args);
            });
        }
    }
} //:send()
//
// open developer tools of current or ID'd webview
//
Navigation.prototype.openDevTools = function(id) {
    id = id || null;
    let webview = null;

    // check id
    if (id == null) {
        webview = $('.nav-views-view.active')[0];
    } else {
        if ($('#' + id).length) {
            webview = document.getElementById(id);
        } else {
            console.log('ERROR[electron-navigation][func "openDevTools();"]: Cannot find the ID "' + id + '"');
        }
    }

    // open dev tools
    if (webview != null) {
        try {
            webview.openDevTools();
        } catch (e) {
            webview.addEventListener("dom-ready", function (event) {
                webview.openDevTools();
            });
        }
    }
} //:openDevTools()
//
// print current or specified tab and view
//
Navigation.prototype.printTab = function (id, opts) {
    id = id || null
    let webview = null

    // check id
    if (id == null) {
        webview = $('.nav-views-view.active')[0]
    } else {
        if ($('#' + id).length) {
            webview = document.getElementById(id)
        } else {
            console.log('ERROR[electron-navigation][func "printTab();"]: Cannot find the ID "' + id + '"')
        }
    }

    // print
    if (webview != null) {
        webview.print(opts || {});
    }
} 
//:nextTab()
//
// toggle next available tab
//
Navigation.prototype.nextTab = function () {
    var tabs = $('.nav-tabs-tab').toArray();
    var activeTabIndex = tabs.indexOf($('.nav-tabs-tab.active')[0]);
    var nexti = activeTabIndex + 1;
    if(nexti > tabs.length-1) nexti = 0;
    $($('.nav-tabs-tab')[nexti]).trigger('click');
    return false
} //:nextTab()
//:prevTab()
//
// toggle previous available tab
//
Navigation.prototype.prevTab = function () {
    var tabs = $('.nav-tabs-tab').toArray();
    var activeTabIndex = tabs.indexOf($('.nav-tabs-tab.active')[0]);
    var nexti = activeTabIndex - 1;
    if(nexti < 0) nexti = tabs.length-1;
    $($('.nav-tabs-tab')[nexti]).trigger('click');
    return false
} //:prevTab()
// go to a tab by index or keyword
//
Navigation.prototype.goToTab = function(index) {
  $activeTabAndView = $('#nav-body-tabs .nav-tabs-tab.active, #nav-body-views .nav-views-view.active');

  if (index == 'previous') {
    $tabAndViewToActivate = $activeTabAndView.prev('#nav-body-tabs .nav-tabs-tab, #nav-body-views .nav-views-view');
  } else if (index == 'next') {
    $tabAndViewToActivate = $activeTabAndView.next('#nav-body-tabs .nav-tabs-tab, #nav-body-views .nav-views-view');
  } else if (index == 'last') {
    $tabAndViewToActivate = $('#nav-body-tabs .nav-tabs-tab:last-of-type, #nav-body-views .nav-views-view:last-of-type');
  } else {
    $tabAndViewToActivate =  $('#nav-body-tabs .nav-tabs-tab:nth-of-type(' + index  + '), #nav-body-views .nav-views-view:nth-of-type(' + index + ')');
  }

  if ($tabAndViewToActivate.length) {
    $('#nav-ctrls-url').blur();
    $activeTabAndView.removeClass('active');
    $tabAndViewToActivate.addClass('active');
    this._updateUrl();
    this._updateCtrls();
  }
} //:goToTab()
/**
 * MODULE EXPORTS
 */
module.exports = Navigation;
