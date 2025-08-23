---
title: teachyourselfmath issue 1
---
### EXPLAINER

**Division algorithm.** For any integers $a$ and $b>0$ there exist unique integers $q,r$ with  

$$
a = qb + r,\quad 0 \le r < b
$$

This lets you reason about all integers by finitely many "cases mod $b$" (e.g., any integer is $0,1,2$ mod $3$).

**Divisibility \& linear combos.** Write $a \mid b$ when $b = ac$ for some integer $c$. If $a \mid b$ and $a \mid c$, then $a \mid (bx+cy)$ for any integers $x,y$.

**Greatest common divisor (gcd).** For integers $a,b$ not both zero, $\gcd(a,b)$ is the largest positive integer dividing both. A key fact (Bézout):  

$$
\gcd(a,b) = ax + by \quad \text{for some integers } x,y
$$

Two integers are **coprime** if their gcd is $1$.

**Euclid's algorithm.** Repeatedly apply the division algorithm to get remainders decreasing to $0$; the last nonzero remainder is $\gcd(a,b)$. Back-substitute to express the gcd as $ax+by$.

**Euclid's lemma.** If $\gcd(a,b)=1$ and $a \mid bc$, then $a \mid c$. (Multiply $ax+by=1$ by $c$.)

**Least common multiple (lcm).** For $a,b>0$,  

$$
\gcd(a,b)\cdot \operatorname{lcm}(a,b) = ab
$$

**Linear Diophantine equations.** For $ax+by=c$, solutions in integers exist iff $\gcd(a,b) \mid c$. If $(x_0,y_0)$ is one solution and $d=\gcd(a,b)$, all solutions are  

$$
x = x_0 + \tfrac{b}{d}t, \quad y = y_0 - \tfrac{a}{d}t, \quad t \in \mathbb{Z}
$$

---

### EASY STUFF

1) Use the division algorithm to write $2025 = 37q + r$ with $0 \le r < 37$.

2) Show the square of any odd integer has the form $8k+1$.

3) Compute $\gcd(252,198)$ by Euclid's algorithm, then find integers $x,y$ with $252x+198y=\gcd(252,198)$.

4) Solve in integers: $15x+21y=6$. Give the general solution.

**sketches**

1) $37\cdot54=1998$, so $2025=37\cdot54+27$.

2) Any integer is $4q,4q+1,4q+2,4q+3$. Odd $\Rightarrow 4q+1$ or $4q+3$; squaring gives $16q^2+8q+1=8(2q^2+q)+1$.

3) $252=1\cdot198+54$, $198=3\cdot54+36$, $54=1\cdot36+18$, $36=2\cdot18 \Rightarrow \gcd=18$.  
Back-substitute: $18=4\cdot54-198=4(252-198)-198=4\cdot252-5\cdot198$.

4) $\gcd(15,21)=3 \mid 6$. One solution from $21-15=6$: $x=-1,y=1$. General:  
$x=-1+7t,\ y=1-5t$, $t \in \mathbb{Z}$.

---

### MEDIUM STUFF

1) Prove any square is $3k$ or $3k+1$.

2) Show any cube is $9k, 9k+1,$ or $9k+8$.

3) Prove $3a^2-1$ is never a perfect square.

4) If $a=qb+r$, prove $\gcd(a,b)=\gcd(b,r)$.

5) Prove Euclid's lemma: if $\gcd(a,b)=1$ and $a \mid bc$, then $a \mid c$.

6) Compute $\gcd(84,330)$ and $\operatorname{lcm}(84,330)$.

7) Solve $18x+5y=48$ in integers; list all positive solutions.

8) Solve $54x+21y=906$ in integers; give one small positive solution and the general form.

9) Prove: if $d=\gcd(a,b)$ then $\gcd(a/d,b/d)=1$.

10) Show no base-10 repunit $11\ldots1$ is a perfect square.

**sketches**

1) Cases $n=3q,3q+1,3q+2$ give $9q^2,9q^2+6q+1,9q^2+12q+4\equiv 0,1,1\pmod3$.

2) Cases mod $9$: cubes are $\equiv 0, \pm1 \pmod9$.

3) From (1), $a^2\equiv 0,1\pmod3 \Rightarrow 3a^2-1\equiv -1,2\pmod3$. Squares are $0,1\pmod3$, contradiction.

4) Common divisors of $a,b$ are exactly common divisors of $b,r=a-qb$. Maximal ones match.

5) With $\gcd(a,b)=1$, take $ax+by=1$. Multiply by $c$: $c=a(cx)+b(cy)$. If $a \mid bc$, then $a \mid c$.

6) Euclid gives $\gcd(84,330)=6$. Then $\operatorname{lcm}=\frac{84\cdot330}{6}=4620$.

7) Mod $5$: $18x\equiv48\equiv3 \Rightarrow 3x\equiv3 \Rightarrow x\equiv1\pmod5$. Take $x=1$, then $y=6$.  
General: $x=1+5t,\ y=6-18t$. Positivity forces $t=0 \Rightarrow (1,6)$.

8) $\gcd(54,21)=3 \mid 906 \Rightarrow$ reduce: $18x+7y=302$. Mod $7$: $18x\equiv302\equiv1 \Rightarrow 4x\equiv1 \Rightarrow x\equiv2\pmod7$.  
Take $x=2 \Rightarrow y=38$. General: $x=2+7t,\ y=38-18t$.

9) From $d=ax_0+by_0$, divide by $d$: $1=(a/d)x_0+(b/d)y_0 \Rightarrow$ coprime.

10) Write $R_n=11\ldots1= (10^{n}-1)/9$. Note $R_n\equiv 3\pmod4$.  
Squares are $0,1\pmod4$, so $R_n$ is not a square.

---

### HARD STUFF

**Find the positive integers $x,y$ minimizing $x+y$ subject to $158x-57y=7$. Also give the full solution set.**

**sketch.** $\gcd(158,57)=1$. Extended Euclid yields $1=-22\cdot158+61\cdot57$.  
Multiply by $7$: $7=(-154)\cdot158+427\cdot57$, so a particular solution is $(x_0,y_0)=(-154,-427)$.  
General solution:  

$$
x = -154 - 57t, \quad y = -427 - 158t, \quad t \in \mathbb{Z}
$$

Set $t=-k$: $x=-154+57k,\ y=-427+158k$.  
Positivity needs $k\ge3$. For $k=3$: $x=17,\ y=47$, $x+y=64$.  
Larger $k$ increases both, so the minimum is $(17,47)$.  
Full positive solutions: $x=17+57m,\ y=47+158m,\ m\ge0$.

---

“Mathematics is the queen of the sciences, and number theory is the queen of mathematics.” — *Carl Friedrich Gauss*
