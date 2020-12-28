function animateCSS(node, animation, callback) {
    // We create a Promise and return it
    return new Promise((resolve) => {

      const prefix = 'animate__';

      const animationName = `${prefix}${animation}`;
  
      node.classList.add(`${prefix}animated`, animationName);
  
      // When the animation ends, we clean the classes and resolve the Promise
      function handleAnimationEnd() {
        node.classList.remove(`${prefix}animated`, animationName);

        if(callback != null)
            callback();

        resolve('Animation ended');
      }
  
      node.addEventListener('animationend', handleAnimationEnd, {once: true});
    });
}