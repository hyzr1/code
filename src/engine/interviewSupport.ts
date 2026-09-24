/** Data structure adapters shared by the browser judge and content checks. */
export const INTERVIEW_SUPPORT = String.raw`
from typing import *
from collections import *
from functools import *
from itertools import *
from heapq import *
from math import inf, ceil, floor, sqrt, gcd, lcm, log, log2
import collections, functools, itertools, heapq, math, random, bisect, copy, json, re

class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right
class Node:
    def __init__(self, val=0, isLeaf=False, topLeft=None, topRight=None, bottomLeft=None, bottomRight=None, neighbors=None, next=None, random=None):
        self.val, self.isLeaf = val, isLeaf
        self.topLeft, self.topRight, self.bottomLeft, self.bottomRight = topLeft, topRight, bottomLeft, bottomRight
        self.neighbors = neighbors if neighbors is not None else []
        self.next, self.random = next, random
class Interval:
    def __init__(self, start=0, end=0): self.start, self.end = start, end
    def __getitem__(self, index): return (self.start, self.end)[index]
    def __iter__(self): return iter((self.start, self.end))
class MountainArray:
    def __init__(self, values): self.values, self.calls = values, 0
    def get(self, index):
        self.calls += 1
        assert self.calls <= 100, "MountainArray allows at most 100 get calls"
        return self.values[index]
    def length(self): return len(self.values)
def _hyzr_tree(values):
    if not values or values[0] is None: return None
    root = TreeNode(values[0]); q = deque([root]); i = 1
    while q and i < len(values):
        node = q.popleft()
        for attr in ('left', 'right'):
            if i < len(values) and values[i] is not None:
                child = TreeNode(values[i]); setattr(node, attr, child); q.append(child)
            i += 1
    return root
def _hyzr_tree_values(root):
    if root is None: return []
    result, q, seen = [], deque([root]), set()
    while q:
        node = q.popleft()
        if node is None: result.append(None); continue
        assert id(node) not in seen, "Output tree has a cycle or reused node"
        seen.add(id(node)); result.append(node.val); q.extend([node.left, node.right])
    while result and result[-1] is None: result.pop()
    return result
def _hyzr_list(values):
    head = ListNode(); cur = head
    for value in values: cur.next = ListNode(value); cur = cur.next
    return head.next
def _hyzr_list_values(head):
    result, seen = [], set()
    while head:
        assert id(head) not in seen, "Output linked list contains a cycle"
        seen.add(id(head)); result.append(head.val); head = head.next
    return result
def _hyzr_plain(value):
    if isinstance(value, (tuple, list, deque, set)): return [_hyzr_plain(x) for x in value]
    if isinstance(value, TreeNode): return _hyzr_tree_values(value)
    if isinstance(value, ListNode): return _hyzr_list_values(value)
    return value
def _hyzr_method(instance, name):
    if hasattr(instance, name): return getattr(instance, name)
    snake = re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
    if hasattr(instance, snake): return getattr(instance, snake)
    public = [getattr(instance, key) for key in dir(instance) if not key.startswith('_') and callable(getattr(instance, key))]
    if len(public) == 1: return public[0]
    raise AttributeError(f'{type(instance).__name__} has no method {name}')
def _hyzr_invoke(subject, slug, meta, values):
    args = copy.deepcopy(values)
    if meta.get('systemdesign'):
        operations, inputs = args
        instance = subject(*inputs[0]); result = [None]
        for method, parameters in zip(operations[1:], inputs[1:]):
            result.append(_hyzr_plain(_hyzr_method(instance, method)(*parameters)))
        return result
    for i, param in enumerate(meta.get('params', [])):
        typ = param['type']
        if typ == 'TreeNode': args[i] = _hyzr_tree(args[i])
        if typ == 'ListNode': args[i] = _hyzr_list(args[i])
        if typ == 'ListNode[]': args[i] = [_hyzr_list(item) for item in args[i]]
        if 'Interval' in typ: args[i] = [Interval(*item) for item in args[i]]
    if slug in ('meeting-rooms', 'meeting-rooms-ii'): args[0] = [Interval(*item) for item in args[0]]
    instance = subject()
    if slug == 'encode-and-decode-strings':
        encoded = instance.encode(args[0]); assert isinstance(encoded, str), 'encode must return a string'
        return instance.decode(encoded)
    if slug == 'serialize-and-deserialize-binary-tree':
        encoded = instance.serialize(args[0]); assert isinstance(encoded, str), 'serialize must return a string'
        return _hyzr_tree_values(instance.deserialize(encoded))
    if slug == 'guess-number-higher-or-lower':
        pick = args.pop(); instance.guessNumber.__globals__['guess'] = lambda value: (pick > value) - (pick < value)
    if slug == 'find-in-mountain-array': args = [args[1], MountainArray(args[0])]
    if slug == 'linked-list-cycle':
        head, pos = args; nodes = []; cur = head
        while cur: nodes.append(cur); cur = cur.next
        if nodes and pos >= 0: nodes[-1].next = nodes[pos]
        args = [head]
    if slug == 'lowest-common-ancestor-of-a-binary-search-tree':
        def find_node(root, value):
            if root is None or root.val == value: return root
            return find_node(root.left if value < root.val else root.right, value)
        args[1:] = [find_node(args[0], value) for value in values[1:]]
    original_nodes = []
    if slug == 'copy-list-with-random-pointer':
        original_nodes = [Node(pair[0]) for pair in values[0]]
        for i, (_, pointer) in enumerate(values[0]):
            original_nodes[i].next = original_nodes[i+1] if i+1<len(original_nodes) else None
            original_nodes[i].random = original_nodes[pointer] if pointer is not None else None
        args = [original_nodes[0] if original_nodes else None]
    if slug == 'clone-graph':
        original_nodes = [Node(i+1) for i in range(len(values[0]))]
        for i, links in enumerate(values[0]): original_nodes[i].neighbors = [original_nodes[j-1] for j in links]
        args = [original_nodes[0] if original_nodes else None]
    method = meta['name']
    result = _hyzr_method(instance, method)(*args)
    if slug == 'lowest-common-ancestor-of-a-binary-search-tree': return result.val if result else None
    if slug == 'clone-graph':
        if result is None: return []
        q, found = [result], {}
        while q:
            node = q.pop()
            if node.val in found: continue
            assert all(node is not original for original in original_nodes), 'Return a deep copy of the graph'
            found[node.val] = sorted(x.val for x in node.neighbors); q.extend(node.neighbors)
        return [found[key] for key in sorted(found)]
    if slug == 'copy-list-with-random-pointer':
        nodes = []; cur = result
        while cur:
            assert all(cur is not original for original in original_nodes), 'Return a deep copy'
            assert cur not in nodes, 'Unexpected cycle'
            nodes.append(cur); cur = cur.next
        return [[node.val, nodes.index(node.random) if node.random else None] for node in nodes]
    if slug == 'construct-quad-tree':
        def expand(node, n):
            assert node is not None, 'Missing quadrant'
            if node.isLeaf: return [[int(node.val)] * n for _ in range(n)]
            half = n // 2
            assert half > 0, 'Non-leaf node at a single cell'
            a,b,c,d = [expand(child,half) for child in (node.topLeft,node.topRight,node.bottomLeft,node.bottomRight)]
            return [x+y for x,y in zip(a,b)] + [x+y for x,y in zip(c,d)]
        return expand(result, len(values[0]))
    if slug in ('remove-element','remove-duplicates-from-sorted-array'):
        assert isinstance(result,int), 'Return the retained length'
        return [result, sorted(args[0][:result])]
    if meta.get('return',{}).get('type') == 'void' or slug in ('reorder-list',):
        result = args[meta.get('output',{}).get('paramindex',0)]
    return _hyzr_plain(result)
def _hyzr_equal(actual, expected):
    if isinstance(actual,(int,float)) and not isinstance(actual,bool) and isinstance(expected,(int,float)) and not isinstance(expected,bool):
        return math.isclose(actual,expected,rel_tol=1e-6,abs_tol=1e-6)
    if isinstance(actual,list) and isinstance(expected,list): return len(actual)==len(expected) and all(_hyzr_equal(a,b) for a,b in zip(actual,expected))
    return type(actual) is type(expected) and actual == expected
def _hyzr_check(subject, slug, meta, inputs, expected):
    observation = {"input": json.dumps(dict(zip([p['name'] for p in meta.get('params',[])], inputs)), default=str)[:6000], "expected": json.dumps(expected, default=str)[:6000]}
    globals().setdefault('_hyzr_capture', []).append(observation)
    actual = _hyzr_invoke(subject, slug, meta, inputs)
    observation['actual'] = json.dumps(actual, default=str)[:6000]
    unordered = {'group-anagrams','top-k-frequent-elements','3sum','4sum','subsets','subsets-ii','permutations','permutations-ii','combinations','combination-sum','combination-sum-ii','generate-parentheses','palindrome-partitioning','letter-combinations-of-a-phone-number','n-queens','word-search-ii','pacific-atlantic-water-flow','minimum-height-trees','word-break-ii','majority-element-ii'}
    if slug in unordered:
        def canonical(value):
            if slug in ('group-anagrams','3sum','4sum','subsets','subsets-ii','combinations','combination-sum','combination-sum-ii'):
                return sorted([sorted(x) if isinstance(x,list) else x for x in value],key=repr)
            return sorted(value,key=repr)
        actual,expected=canonical(actual),canonical(expected)
    if slug == 'remove-element':
        assert actual == [sum(value != inputs[1] for value in inputs[0]), sorted(value for value in inputs[0] if value != inputs[1])]
        return
    if slug == 'remove-duplicates-from-sorted-array':
        unique = sorted(set(inputs[0])); assert actual == [len(unique), unique]; return
    if slug in ('two-sum','two-sum-ii-input-array-is-sorted'):
        offset = int(slug != 'two-sum'); a=actual
        assert isinstance(a,list) and len(a)==2 and all(isinstance(i,int) for i in a), 'Return two indices'
        assert len(set(a))==2 and all(0 <= i-offset < len(inputs[0]) for i in a), 'Indices must be distinct and in range'
        assert sum(inputs[0][i-offset] for i in a)==inputs[1], 'Selected values do not sum to target'
        return
    if slug == 'course-schedule-ii':
        if expected == []: assert actual == [], 'A cycle prevents completion'; return
        assert sorted(actual)==list(range(inputs[0])), 'Include each course exactly once'
        positions={v:i for i,v in enumerate(actual)}
        assert all(positions[b]<positions[a] for a,b in inputs[1]), 'Prerequisite order violated'; return
    if slug == 'alien-dictionary':
        if expected == '': assert actual == ''; return
        chars=set(''.join(inputs[0])); assert set(actual)==chars and len(actual)==len(chars)
        positions={c:i for i,c in enumerate(actual)}
        for a,b in zip(inputs[0],inputs[0][1:]):
            for x,y in zip(a,b):
                if x != y: assert positions[x]<positions[y]; break
        return
    if slug == 'reorganize-string':
        if expected == '': assert actual == ''; return
        assert Counter(actual)==Counter(inputs[0]) and all(a!=b for a,b in zip(actual,actual[1:])), 'Preserve letters without adjacent repeats'; return
    if slug == 'longest-happy-string':
        assert isinstance(actual,str) and len(actual)==len(expected) and not any(c*3 in actual for c in 'abc') and all(actual.count(c)<=n for c,n in zip('abc',inputs)) and set(actual)<=set('abc'); return
    if slug == 'longest-palindromic-substring':
        assert actual in inputs[0] and actual==actual[::-1] and len(actual)==len(expected), 'Return a longest palindrome'; return
    if slug == 'k-closest-points-to-origin':
        assert len(actual)==inputs[1] and all(Counter(map(tuple,actual))[p]<=Counter(map(tuple,inputs[0]))[p] for p in map(tuple,actual))
        assert sorted(x*x+y*y for x,y in actual)==sorted(x*x+y*y for x,y in inputs[0])[:inputs[1]]; return
    if slug == 'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree': actual,expected=[sorted(x) for x in actual],[sorted(x) for x in expected]
    if slug == 'accounts-merge': actual,expected=sorted([x[:1]+sorted(x[1:]) for x in actual]),sorted([x[:1]+sorted(x[1:]) for x in expected])
    if slug == 'build-a-matrix-with-conditions':
        if expected == []: assert actual == []; return
        k=inputs[0]; assert len(actual)==k and all(len(row)==k for row in actual)
        positions={v:(r,c) for r,row in enumerate(actual) for c,v in enumerate(row) if v}
        assert sorted(v for row in actual for v in row if v)==list(range(1,k+1))
        assert all(positions[a][0]<positions[b][0] for a,b in inputs[1]) and all(positions[a][1]<positions[b][1] for a,b in inputs[2]); return
    assert _hyzr_equal(actual,expected), f'Expected {expected!r}, got {actual!r}'
`;
