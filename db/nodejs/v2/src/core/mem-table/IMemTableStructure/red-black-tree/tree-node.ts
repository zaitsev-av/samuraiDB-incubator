import {Color} from "./color";

export class TreeNode<TKey, TValue> {
    key: TKey;
    value: TValue;
    color: Color;
    left: TreeNode<TKey, TValue> | null;
    right: TreeNode<TKey, TValue> | null;
    parent: TreeNode<TKey, TValue> | null;

    constructor(key: TKey, value: TValue, color: Color = Color.RED, parent: TreeNode<TKey, TValue> | null = null) {
        this.key = key;
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = parent;
    }
}