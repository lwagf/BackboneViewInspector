// View component -- View highlighter
(function(){

   function ViewComponent(_doc){
        this._wrapped = null;
        this._doc = _doc;
        this.wrapperClickHandler = _wrapperClickHandler.bind(this);
        this.messageListener = _messageListener.bind(this);
        this.positionWrapper = positionWrapper.bind(this);
    }

    ViewComponent.prototype.init = function(){
        this.initWrapper();
        this.attachEvents();
    }

    ViewComponent.prototype.destroy = function(){
        this.detachEvents();
    }

    ViewComponent.prototype.initWrapper = function (){
        this._wrapper = this._doc.createElement('div');
        this._wrapper.id = "__wrapper";
        this._wrapper.addEventListener('click', this.wrapperClickHandler);
        this._doc.body.appendChild(this._wrapper);
    }

    function _wrapperClickHandler(eve){
        if(this._wrapper.isActive){
            this._wrapper.className = "";
            this._wrapper.isActive = false;
            this.on();
        }
        else {
            this._wrapper.className = "active";
            this._wrapper.isActive = true;
            this.off();
        }
    }

    ViewComponent.prototype.getElementToBeHighlighted = function (eve){
        var self = this;
        var element,
            x = eve.clientX,
            y = eve.clientY,
            elements = this._doc.elementsFromPoint(x, y);
        element = elements.find(function(element){
            if(element != self._wrapper){
                return true;
            }
            return false;
        });
        return $(element).closest("[view-url]")[0];
    }

    function _positionWrapper(eve){
        var eleToBeHighlighted = this.getElementToBeHighlighted(eve);
        if(!eleToBeHighlighted){
            this.hideWrapper();
        }
        else if(eleToBeHighlighted != this._wrapper.activeElement){
            var position = eleToBeHighlighted.getBoundingClientRect();
            this._wrapper.activeElement = eleToBeHighlighted;
            this._wrapper.title = eleToBeHighlighted.getAttribute('view-url');
            this._wrapper.style.top = position.top + "px";
            this._wrapper.style.left = position.left + "px";
            this._wrapper.style.width = eleToBeHighlighted.clientWidth + "px";
            this._wrapper.style.height = eleToBeHighlighted.clientHeight + "px";
            this._wrapper.style.display = "block";
        }
    }

    function positionWrapper(eve){
        var self = this;
        window.setTimeout(function(eve){
            _positionWrapper.call(self, eve);
        }, 200, eve);
    }

    function _messageListener(message){
        if(message.action == "ON_TRACKER"){
            this.on();
        }
        else if(message.action == "OFF_TRACKER"){
            this.hideWrapper();
            this.off();
        }
    }

    ViewComponent.prototype.attachEvents = function (){
        chrome.runtime.onMessage.addListener(this.messageListener);
        this._doc.addEventListener('unload', this.destroy);
    }

    ViewComponent.prototype.on = function (){
        this._doc.addEventListener('mousemove', this.positionWrapper, true);
    }

    ViewComponent.prototype.off = function (){
        this._doc.removeEventListener('mousemove', this.positionWrapper, true);
    }

    ViewComponent.prototype.hideWrapper = function (){
        this._wrapper.style.display = "none";
    }

    ViewComponent.prototype.detachEvents = function (){
        this.hideWrapper();
        this.off();
    }

    window.addEventListener('load', function(eve){
        new ViewComponent(document).init();
    });
})();

(function(){

	window.BVT || (window.BVT = {});
    window.BVT.core || (window.BVT.core = {});

    window.BVT.core.injectScripts = function(doc){
        BVT.core.loadScriptsOnPage(doc, ['js/lib/object-watch.js', 'js/inject.js']);
    };

    window.BVT.core.loadScriptsOnPage = function(doc, scripts){
        var s = doc.createElement('script');
        s.setAttribute('type', 'text/javascript');
        doc.body.firstElementChild ? doc.body.insertBefore(s, doc.body.firstElementChild)
            : doc.body.appendChild(s);
        s.onload = function(eve){
            if(scripts.length) {
                window.BVT.core.loadScriptsOnPage(doc, scripts);
            }
        }
        s.setAttribute('src', chrome.extension.getURL(scripts.shift()));
    }
})();

document.addEventListener("DOMContentLoaded", function(event) {
    BVT.core.injectScripts(document);
});