document.querySelectorAll('.ripple-button').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const size = Math.max(button.offsetWidth, button.offsetHeight);
        ripple.style.width = ripple.style.height = `${size}px`;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - (size / 2);
        const y = e.clientY - rect.top - (size / 2);
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    });
});