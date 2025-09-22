'''
第一題
題目敘述說不能使用遞迴方式去反轉這個二元樹，所以我選擇用廣度優先的算法去做。
主要實作可以參考 invertTree()

Quick Start
$ python3 invert_tree.py
'''

from collections import deque
from typing import Optional


# 二元樹的資料結構
class TreeNode():
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# 初始化 test case 的二元樹
def initialTree(case: list[int]) -> TreeNode:
    if not case:
        return None
    
    if case[0] is None:
        return None

    root = TreeNode(case[0])
    q = deque([root])
    i = 1
    n = len(case)
    while q and i < n:
        node = q.popleft()

        # left node
        if i < n and case[i] is not None:
            node.left = TreeNode(case[i])
            q.append(node.left)
        i += 1

        # right node
        if i < n and case[i] is not None:
            node.right = TreeNode(case[i])
            q.append(node.right)
        i += 1
    return root

# 將二元樹轉為 list of integer 方便查看結果
def visualize(root: Optional[TreeNode]) -> list[int]:
    if not root:
        return []
    
    result = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node is None:
            result.append(None)
            continue

        result.append(node.val)
        
        q.append(node.left)
        q.append(node.right)

    while result and result[-1] is None:
        result.pop()
    return result

# 主要實作，將二元樹反轉
def invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:
    # 透過不斷地將左節點與右結點反轉，並且將下一層的 node append 到 queue 中，直到結束。
    # Time complexity : O(n), n 為節點的數量
    if root is None:
        return None

    q = deque([root])
    while q:
        node = q.popleft()
        node.left, node.right = node.right, node.left

        if node.left:
            q.append(node.left)
        if node.right:
            q.append(node.right)
    
    return root
        
if __name__ == "__main__":
    testCases = [
        # 題目上的 test case
        [5,3,8,1,7,2,6],
        [6,8,9],
        [5,3,8,1,7,2,6,100,3,-1],
        # Edge case
        [],
        [None],
        [1],
        [1,2],
        [1,None,2]
        # 可以在這裡往後加
        
    ]
    trees = []

    # 初始化所有 test case 為二元樹
    for case in testCases:
        trees.append(initialTree(case))
    

    # 執行二元樹反轉並且將前後結果輸出在 console
    result = []
    for i, tree in enumerate(trees):
        # 因為 tree 是 in-place 的反轉，所以這裡先將原始的樹轉為 list of integer
        originalTreeList = visualize(tree)
        invertedTree = invertTree(tree)
        invertedTreeList = visualize(invertedTree)
        
        print('--------------------\n')
        print(f'''Test Case {i+1} \ninput tree: {originalTreeList} \noutput tree: {invertedTreeList}\n''')
    
