(function (my) {

  my.poses = {}

  my.init = () => {
    let links = [...document.querySelectorAll('nav > a')]
      .filter(my.linksWithAnchor)
      .forEach(my.applyPosAndClick)
  }

  my.linksWithAnchor = link => {
    return link.href.indexOf('#') !== -1
  }

  my.applyPosAndClick = link => {
    let anchorName = my.getLinkAnchorName(link)
    let h2Targeted = document.querySelector('h2' + anchorName)
    
    my.poses[anchorName] = (h2Targeted.offsetTop - 100)
    
    link.onclick = my.goToAnchor
  }

  my.goToAnchor = e => {
    e.preventDefault()

    let link = e.target
    let anchorName = my.getLinkAnchorName(link)
    
    my.scrollTo(my.poses[anchorName], 500)
  }

  my.getLinkAnchorName = link => link.href.substr(link.href.indexOf('#'))

  my.scrollTo = (target, duration) => {
    target = Math.round(target)
    duration = Math.round(duration)
    let element = document.documentElement
    if (duration < 0) {
      return Promise.reject("bad duration")
    }
    if (duration === 0) {
      element.scrollTop = target
      return Promise.resolve()
    }

    let start_time = Date.now()
    let end_time = start_time + duration

    let start_top = element.scrollTop
    let distance = target - start_top

    // based on http://en.wikipedia.org/wiki/Smoothstep
    let smooth_step = function(start, end, point) {
        if(point <= start) { return 0 }
        if(point >= end) { return 1 }
        let x = (point - start) / (end - start) // interpolation
        return x*x*(3 - 2*x)
    }

    return new Promise(function(resolve, reject) {
        // This is to keep track of where the element's scrollTop is
        // supposed to be, based on what we're doing
        let previous_top = element.scrollTop

        // This is like a think function from a game loop
        let scroll_frame = function() {
            if(element.scrollTop != previous_top) {
                reject("interrupted")
                return
            }

            // set the scrollTop for this frame
            let now = Date.now()
            let point = smooth_step(start_time, end_time, now)
            let frameTop = Math.round(start_top + (distance * point))
            element.scrollTop = frameTop

            // check if we're done!
            if(now >= end_time) {
                resolve()
                return
            }

            // If we were supposed to scroll but didn't, then we
            // probably hit the limit, so consider it done not
            // interrupted.
            if(element.scrollTop === previous_top
                && element.scrollTop !== frameTop) {
                resolve()
                return
            }
            previous_top = element.scrollTop

            // schedule next frame for execution
            setTimeout(scroll_frame, 0)
        }

        // boostrap the animation process
        setTimeout(scroll_frame, 0)
    })
  }

  my.init()
})({})