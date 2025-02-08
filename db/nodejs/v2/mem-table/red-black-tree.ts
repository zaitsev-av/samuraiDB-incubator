import {IMemTableStructure} from "./i-mem-table-structure";

export enum Color {
    RED = "RED",
    BLACK = "BLACK"
}

export interface Comparable {
    compare(other: this): number;
}

export class TreeNode<T extends Comparable> {
    value: T;
    color: Color;
    left: TreeNode<T> | null;
    right: TreeNode<T> | null;
    parent: TreeNode<T> | null;

    constructor(value: T, color: Color = Color.RED, parent: TreeNode<T> | null = null) {
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = parent;
    }
}

export class RedBlackTree<T extends Comparable>  implements IMemTableStructure<T>  {
    private root: TreeNode<T> | null = null;

    private rotateLeft(node: TreeNode<T>): void {
        const rightChild = node.right;
        if (!rightChild) return;

        node.right = rightChild.left;
        if (rightChild.left) rightChild.left.parent = node;

        rightChild.parent = node.parent;
        if (!node.parent) {
            this.root = rightChild;
        } else if (node === node.parent.left) {
            node.parent.left = rightChild;
        } else {
            node.parent.right = rightChild;
        }

        rightChild.left = node;
        node.parent = rightChild;
    }

    private rotateRight(node: TreeNode<T>): void {
        const leftChild = node.left;
        if (!leftChild) return;

        node.left = leftChild.right;
        if (leftChild.right) leftChild.right.parent = node;

        leftChild.parent = node.parent;
        if (!node.parent) {
            this.root = leftChild;
        } else if (node === node.parent.right) {
            node.parent.right = leftChild;
        } else {
            node.parent.left = leftChild;
        }

        leftChild.right = node;
        node.parent = leftChild;
    }

    private fixInsertion(node: TreeNode<T>): void {
        while (node.parent && node.parent.color === Color.RED) {
            const grandparent = node.parent.parent;
            if (!grandparent) break;

            if (node.parent === grandparent.left) {
                const uncle = grandparent.right;
                if (uncle && uncle.color === Color.RED) {
                    node.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    node = grandparent;
                } else {
                    if (node === node.parent.right) {
                        node = node.parent;
                        this.rotateLeft(node);
                    }
                    node.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.rotateRight(grandparent);
                }
            } else {
                const uncle = grandparent.left;
                if (uncle && uncle.color === Color.RED) {
                    node.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    node = grandparent;
                } else {
                    if (node === node.parent.left) {
                        node = node.parent;
                        this.rotateRight(node);
                    }
                    node.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.rotateLeft(grandparent);
                }
            }
        }
        this.root!.color = Color.BLACK;
    }

    insert(value: T): void {
        if (!this.root) {
            this.root = new TreeNode(value, Color.BLACK);
            return;
        }

        let parent: TreeNode<T> | null = null;
        let current: TreeNode<T> | null = this.root;
        while (current) {
            parent = current;
            current = value.compare(current.value) < 0 ? current.left : current.right;
        }

        const newNode = new TreeNode(value, Color.RED, parent);
        if (value.compare(parent!.value) < 0) {
            parent!.left = newNode;
        } else {
            parent!.right = newNode;
        }

        this.fixInsertion(newNode);
    }

    delete(value: T): void {
        let node = this.findNode(value);
        if (!node) return;

        let y = node;
        let yOriginalColor = y.color;
        let x: TreeNode<T> | null;

        if (!node.left) {
            x = node.right;
            this.transplant(node, node.right);
        } else if (!node.right) {
            x = node.left;
            this.transplant(node, node.left);
        } else {
            y = this.minimum(node.right);
            yOriginalColor = y.color;
            x = y.right;

            if (y.parent === node) {
                if (x) x.parent = y;
            } else {
                this.transplant(y, y.right);
                y.right = node.right;
                if (y.right) y.right.parent = y;
            }

            this.transplant(node, y);
            y.left = node.left;
            if (y.left) y.left.parent = y;
            y.color = node.color;
        }

        if (yOriginalColor === Color.BLACK && x) {
            this.fixDeletion(x);
        }
    }

    private transplant(u: TreeNode<T>, v: TreeNode<T> | null): void {
        if (!u.parent) {
            this.root = v;
        } else if (u === u.parent.left) {
            u.parent.left = v;
        } else {
            u.parent.right = v;
        }
        if (v) v.parent = u.parent;
    }

    private fixDeletion(x: TreeNode<T>): void {
        while (x !== this.root && x.color === Color.BLACK) {
            if (x === x.parent!.left) {
                let w = x.parent!.right!;
                if (w.color === Color.RED) {
                    w.color = Color.BLACK;
                    x.parent!.color = Color.RED;
                    this.rotateLeft(x.parent!);
                    w = x.parent!.right!;
                }
                if (w.left!.color === Color.BLACK && w.right!.color === Color.BLACK) {
                    w.color = Color.RED;
                    x = x.parent!;
                } else {
                    if (w.right!.color === Color.BLACK) {
                        w.left!.color = Color.BLACK;
                        w.color = Color.RED;
                        this.rotateRight(w);
                        w = x.parent!.right!;
                    }
                    w.color = x.parent!.color;
                    x.parent!.color = Color.BLACK;
                    w.right!.color = Color.BLACK;
                    this.rotateLeft(x.parent!);
                    x = this.root!;
                }
            } else {
                let w = x.parent!.left!;
                if (w.color === Color.RED) {
                    w.color = Color.BLACK;
                    x.parent!.color = Color.RED;
                    this.rotateRight(x.parent!);
                    w = x.parent!.left!;
                }
                if (w.right!.color === Color.BLACK && w.left!.color === Color.BLACK) {
                    w.color = Color.RED;
                    x = x.parent!;
                } else {
                    if (w.left!.color === Color.BLACK) {
                        w.right!.color = Color.BLACK;
                        w.color = Color.RED;
                        this.rotateLeft(w);
                        w = x.parent!.left!;
                    }
                    w.color = x.parent!.color;
                    x.parent!.color = Color.BLACK;
                    w.left!.color = Color.BLACK;
                    this.rotateRight(x.parent!);
                    x = this.root!;
                }
            }
        }
        x.color = Color.BLACK;
    }

    private minimum(node: TreeNode<T>): TreeNode<T> {
        while (node.left) node = node.left;
        return node;
    }

    public findNode(value: T): TreeNode<T> | null {
        let current = this.root;
        while (current) {
            const cmp = value.compare(current.value);
            if (cmp === 0) return current;
            current = cmp < 0 ? current.left : current.right;
        }
        return null;
    }

    find(value: T): T | null {
        return this.findNode(value)?.value
    }
}
