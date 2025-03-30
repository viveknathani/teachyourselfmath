# linear algebra

### vector

For a physics student, a vector is a quantity that has both magnitude and direction.

For a mathematician, a vector is an element of a vector space.

For a computer scientist, a vector is an array of numbers.

The components of a vector are the numbers that make up the vector.

### operations

There are two fundamental operations on vectors: addition and scalar multiplication.

Combining these two operations gives you a linear combination of vectors. Example: 2v1 + 3v2. We may generalize this as a1v1 + a2v2 + ... + anvn.

Addition of vectors is done, component-wise.

### what do the combinations fill?

a1v1 fills a line.

a1v1 + a2v2 fills an entire two-dimensional plane if v2 is not on the same line as v1.

a1v1 + a2v2 + a3v3 fills a three-dimensional space if v3 is not in the plane defined by v1 and v2. If the numbers are real, this space is R^3.

line -> plane -> space is a typical situation but it may not be the case always.

### length of a vector

The length of a vector is the magnitude of the vector.

||a|| = sqrt(a1^2 + a2^2 + ... + an^2)

Some books show length as |a|.

Length of a unit vector is 1.

unit vector u = a / ||a||

### dot product

The dot product of two vectors is a scalar value that represents the angle between the vectors. 

a * b = |a| * |b| * cos(theta), where a and b are vectors and theta is the angle between them.

The dot product is commutative: a * b = b * a.

The dot product is distributive: a * (b + c) = a * b + a * c.

The dot product is linear: a * (b + c) = a * b + a * c.

Looking at cos(theta), we can see that the dot product of two perpendicular vectors is 0.

Dot product does not obey the cancellation law.

### schwarz inequality

||a * b|| <= ||a|| * ||b||

This is considered as a pretty important inequality.

### triangle inequality

||a + b|| <= ||a|| + ||b||

### matrix

A matrix is a rectangular array of numbers.

An m x n matrix has m rows and n columns.

When looking at a matrix based equation, if you want to convert it into a linear combination of vectors, you can do so by treating each column of the matrix as a vector.

### linear equations

We are fundamentally interested in solving Ax = b, where A is a matrix, x is a vector, and b is a vector.

Ax gives a linear combination where the vectors are the columns of A and the coefficients are the components of x.

Ax is also dot product of rows of A with the column of x. In this view, it helps to look at the vector x as a matrix with a single column.

x = A^(-1)b

In some cases, the matrix A may not be invertible.

### independence and dependence

Let {v1, v2, v3, ..., vn} be a set of vectors.

We say these vectors are linearly independent if the only way to write a linear combination equal to the zero vector is if all the coefficients are 0.

On the other hand, we say these vectors are linearly dependent if there exists a non-zero linear combination equal to the zero vector. In that case, at least one of them can be written as a linear combination of the others.

Linearly independent: No vector in the set is “redundant.” You cannot express any vector as a combination of the others.

Linearly dependent: At least one vector in the set is “redundant,” meaning it can be expressed as a linear combination of the others (nontrivially).

Linearly dependent vectors in the 2D plane form a line.

Linearly dependent vectors in the 3D space may form a plane or a line.

A matrix is not invertible if the columns are linearly dependent.