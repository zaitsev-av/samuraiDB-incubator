import {Color, RedBlackTree} from "./red-black-tree";


// We'll expose TreeNode type for testing purposes
type TreeNode<TKey, TValue> = {
    color: Color;
    key: TKey;
    value: TValue;
    left: TreeNode<TKey, TValue> | null;
    right: TreeNode<TKey, TValue> | null;
    parent: TreeNode<TKey, TValue> | null;
};

describe("RedBlackTree", () => {
    let tree: RedBlackTree<number, string>;

    beforeEach(() => {
        tree = new RedBlackTree<number, string>();
    });

    test("should insert elements and find them", () => {
        tree.insert(10, "ten");
        tree.insert(20, "twenty");
        tree.insert(5, "five");

        expect(tree.find(10)).toBe("ten");
        expect(tree.find(20)).toBe("twenty");
        expect(tree.find(5)).toBe("five");
        expect(tree.find(100)).toBeNull();
    });

    test("root should be black", () => {
        tree.insert(10, "ten");
        // Access private root property for testing
        const root = (tree as any).root as TreeNode<number, string>;
        expect(root).not.toBeNull();
        expect(root.color).toBe(Color.BLACK);
    });

    test("should not have two consecutive red nodes", () => {
        tree.insert(10, "ten");
        tree.insert(20, "twenty");
        tree.insert(30, "thirty");
        tree.insert(15, "fifteen");
        tree.insert(25, "twenty-five");

        function checkNoRedRed(node: TreeNode<number, string> | null): void {
            if (!node) return;
            if (node.color === Color.RED) {
                if (node.left?.color === Color.RED || node.right?.color === Color.RED) {
                    throw new Error("Violated the rule of two consecutive red nodes");
                }
            }
            checkNoRedRed(node.left);
            checkNoRedRed(node.right);
        }

        expect(() => checkNoRedRed((tree as any).root)).not.toThrow();
    });

    test("deletion should work correctly", () => {
        tree.insert(10, "ten");
        tree.insert(20, "twenty");
        tree.insert(5, "five");

        tree.delete(10);
        expect(tree.find(10)).toBeNull();
    });

    test("leaf node deletion should maintain tree properties", () => {
        tree.insert(10, "ten");
        tree.insert(5, "five");
        tree.insert(15, "fifteen");

        tree.delete(5);
        expect(tree.find(5)).toBeNull();
        expect(() => validateRedBlackTree(tree)).not.toThrow();
    });

    test("deletion of node with one child should work correctly", () => {
        tree.insert(10, "ten");
        tree.insert(5, "five");
        tree.insert(1, "one");

        tree.delete(5);
        expect(tree.find(5)).toBeNull();
        expect(() => validateRedBlackTree(tree)).not.toThrow();
    });

    test("deletion of node with two children should replace with successor", () => {
        tree.insert(10, "ten");
        tree.insert(5, "five");
        tree.insert(15, "fifteen");
        tree.insert(12, "twelve");

        tree.delete(10);
        expect(tree.find(10)).toBeNull();
        expect(() => validateRedBlackTree(tree)).not.toThrow();
    });

    function validateRedBlackTree(tree: RedBlackTree<number, string>) {
        // Access private root property for testing
        const root = (tree as any).root as TreeNode<number, string>;

        function checkProperties(node: TreeNode<number, string> | null): number {
            if (!node) return 1; // null nodes are considered black

            const leftBlackHeight = checkProperties(node.left);
            const rightBlackHeight = checkProperties(node.right);

            if (leftBlackHeight !== rightBlackHeight) {
                throw new Error("Black height property is violated");
            }

            if (node.color === Color.RED) {
                if (node.left?.color === Color.RED || node.right?.color === Color.RED) {
                    throw new Error("Two consecutive red nodes found");
                }
            }

            // Verify binary search tree property
            if (node.left && node.left.key >= node.key) {
                throw new Error("Binary search tree property violated on left");
            }
            if (node.right && node.right.key <= node.key) {
                throw new Error("Binary search tree property violated on right");
            }

            return leftBlackHeight + (node.color === Color.BLACK ? 1 : 0);
        }

        if (root && root.color !== Color.BLACK) {
            throw new Error("Root must be black");
        }

        checkProperties(root);
    }
});