const problems = [
    "Show that \\(\\log_{6}2+\\log_{6}3=1\\).",
    "Given that \\(\\log_{3}2=0.631\\), find the smallest positive integer \\(a\\) such that \\(3^{a}>2^{102}\\). (Hint: Show that \\(\\log_{3}2^{102}=102\\log_{3}2\\).)",
    "Show that if \\(a\\neq c\\), \\(a^{x}=c^{q}\\) and \\(c^{y}=a^{2}\\), then \\(xy=qz\\).",
    "Find \\(\\log_{\\sqrt{5}}\\sqrt[3]{9}\\)",
    "Prove that there are infinitely many prime numbers.",
    "If \\(p\\) is a prime number greater than 2, prove that \\(p^2 - 1\\) is divisible by 24.",
    "Show that there are no integers \\(a, b, c\\) such that \\(a^2 + b^2 = c^2\\) and \\(a, b, c\\) are consecutive integers.",
    "Prove that if \\(a\\) and \\(b\\) are integers and \\(a^2 + b^2\\) is divisible by 3, then both \\(a\\) and \\(b\\) are divisible by 3.",
    "If \\(a\\) and \\(b\\) are positive integers such that \\(a^2 + b^2\\) is divisible by 5, prove that both \\(a\\) and \\(b\\) are divisible by 5.",
    "Show that there are infinitely many primes of the form \\(4k + 3\\), where \\(k\\) is a positive integer.",
    "Prove that if \\(n\\) is an odd integer, then \\(n^2 - 1\\) is divisible by 8.",
    "If \\(a\\) and \\(b\\) are positive integers such that \\(ab + 1\\) is divisible by 5, prove that \\(a^2 + b^2\\) is composite.",
    "Show that the equation \\(x^2 - 2y^2 = 1\\) has infinitely many solutions in positive integers.",
    "Prove that for any positive integer \\(n\\), the sum of the first \\(n\\) positive integers is equal to \\(n(n + 1)/2\\).",
    "Prove that the square root of 2 is irrational.",
    "If \\(p\\) is a prime number greater than 5, prove that \\(p^2 - 1\\) is divisible by 3.",
    "Show that for any positive integers \\(a, b, c\\), if \\(a^2 + b^2 = c^2\\), then at least one of \\(a, b\\) must be even.",
    "Prove that there are infinitely many primes of the form \\(6k + 1\\) and \\(6k - 1\\), where \\(k\\) is a positive integer.",
    "If \\(a\\) and \\(b\\) are positive integers such that \\(ab + 1\\) is prime, prove that both \\(a\\) and \\(b\\) are perfect squares.",
    "Show that if \\(n > 1\\) is an integer, then \\(n! = 1 \\cdot 2 \\cdot 3 \\cdot \\ldots \\cdot n\\) is not a perfect square.",
    "Prove that there are infinitely many primes that can be expressed in the form \\(4n + 1\\).",
    "If \\(p\\) is a prime number greater than 3, prove that \\(p^2 - 1\\) is divisible by 8.",
    "Show that if \\(a^2 + b^2 + c^2 = d^2\\) for positive integers \\(a, b, c, d\\), then at least one of them must be divisible by 3.",
    "Prove that the product of four consecutive integers is always divisible by 4."
];

const list = document.getElementsByTagName('ol')[0];

console.log('loaded!')
window.MathJax.typeset();

problems.forEach(problem => {
    const li = document.createElement('li');
    const topDiv = document.createElement('div');
    topDiv.id = "topDiv";
    topDiv.className = "font-primary";
    const bottomDiv = document.createElement('div');
    bottomDiv.id = "bottomDiv";
    bottomDiv.className = "font-accent";
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    p1.innerText = problem;
    p2.innerText = "2 hours ago | 5 comments | number theory";
    topDiv.appendChild(p1);
    bottomDiv.appendChild(p2);
    li.appendChild(topDiv);
    li.appendChild(bottomDiv);
    list.appendChild(li);
});

MathJax.typeset();
