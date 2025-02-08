import { RedBlackTree, TreeNode, Color } from "./red-black-tree"; // Проверь путь к файлу

class ComparableNumber {
    constructor(public value: number) {}
    compare(other: ComparableNumber): number {
        return this.value - other.value;
    }
    toString(): string {
        return this.value.toString();
    }
}

describe("RedBlackTree", () => {
    let tree: RedBlackTree<ComparableNumber>;

    beforeEach(() => {
        tree = new RedBlackTree<ComparableNumber>();
    });

    test("должно вставлять элементы и находить их", () => {
        tree.insert(new ComparableNumber(10));
        tree.insert(new ComparableNumber(20));
        tree.insert(new ComparableNumber(5));

        expect(tree.findNode(new ComparableNumber(10))).not.toBeNull();
        expect(tree.findNode(new ComparableNumber(20))).not.toBeNull();
        expect(tree.findNode(new ComparableNumber(5))).not.toBeNull();
        expect(tree.findNode(new ComparableNumber(100))).toBeNull();
    });

    test("корень должен быть черным", () => {
        tree.insert(new ComparableNumber(10));
        const root = tree.findNode(new ComparableNumber(10));
        expect(root).not.toBeNull();
        expect(root!.color).toBe(Color.BLACK);
    });

    test("не должно быть двух красных узлов подряд", () => {
        tree.insert(new ComparableNumber(10));
        tree.insert(new ComparableNumber(20));
        tree.insert(new ComparableNumber(30));
        tree.insert(new ComparableNumber(15));
        tree.insert(new ComparableNumber(25));

        function checkNoRedRed(node: TreeNode<ComparableNumber> | null): void {
            if (!node) return;
            if (node.color === Color.RED) {
                if (node.left?.color === Color.RED || node.right?.color === Color.RED) {
                    throw new Error("Нарушено правило двух красных узлов подряд");
                }
            }
            checkNoRedRed(node.left);
            checkNoRedRed(node.right);
        }

        expect(() => checkNoRedRed(tree["root"])).not.toThrow();
    });

    test("удаление элемента корректно работает", () => {
        tree.insert(new ComparableNumber(10));
        tree.insert(new ComparableNumber(20));
        tree.insert(new ComparableNumber(5));

        tree.delete(new ComparableNumber(10));
        expect(tree.findNode(new ComparableNumber(10))).toBeNull();
    });

    test("удаление листового узла не нарушает свойства дерева", () => {
        tree.insert(new ComparableNumber(10));
        tree.insert(new ComparableNumber(5));
        tree.insert(new ComparableNumber(15));

        tree.delete(new ComparableNumber(5));
        expect(tree.findNode(new ComparableNumber(5))).toBeNull();
        expect(() => validateRedBlackTree(tree)).not.toThrow();
    });

    test("удаление узла с одним ребенком работает корректно", () => {
        tree.insert(new ComparableNumber(10));
        tree.insert(new ComparableNumber(5));
        tree.insert(new ComparableNumber(1));

        tree.delete(new ComparableNumber(5));
        expect(tree.findNode(new ComparableNumber(5))).toBeNull();
        expect(() => validateRedBlackTree(tree)).not.toThrow();
    });

    test("удаление узла с двумя детьми заменяет его на преемника", () => {
        tree.insert(new ComparableNumber(10));
        tree.insert(new ComparableNumber(5));
        tree.insert(new ComparableNumber(15));
        tree.insert(new ComparableNumber(12));

        tree.delete(new ComparableNumber(10));
        expect(tree.findNode(new ComparableNumber(10))).toBeNull();
        expect(() => validateRedBlackTree(tree)).not.toThrow();
    });

    function validateRedBlackTree(tree: RedBlackTree<ComparableNumber>) {
        function checkProperties(node: TreeNode<ComparableNumber> | null): number {
            if (!node) return 1;

            const leftBlackHeight = checkProperties(node.left);
            const rightBlackHeight = checkProperties(node.right);

            if (leftBlackHeight !== rightBlackHeight) {
                throw new Error("Нарушена черная высота дерева");
            }

            if (node.color === Color.RED) {
                if (node.left?.color === Color.RED || node.right?.color === Color.RED) {
                    throw new Error("Нарушено правило двух красных узлов подряд");
                }
            }

            return leftBlackHeight + (node.color === Color.BLACK ? 1 : 0);
        }

        checkProperties(tree["root"]);
    }
});
