/**
 * A single Node within the Trie, storing a letter and it's next corresponding nodes
 */
class TrieNode {
    constructor () {
        this.children = {};
        this.isEndOfWord = false;
    }
}

/**
 * Trie Data Structure, contains all the methods to insert nodes in the Trie and search within the Trie
 */
export default class Trie {
    constructor (root = new TrieNode()) {
        this.root = root;
    }

    /**
     * Inserts the given word into the trie node. Returns True if inserted, and False if not inserted (already exists)
     * @param {String} word 
     */
    insert (word) {
        let curNode = this.root;
        let nodeCreated;

        for (let i = 0; i < word.length; i++) {
            const curLetter = word.charAt(i);
            nodeCreated = false;

            if (!(curLetter in curNode.children)) {
                curNode.children[curLetter] = new TrieNode();
                nodeCreated = true;
            }
            
            curNode = curNode.children[curLetter];
        }

        curNode.isEndOfWord = true;
        return nodeCreated;
    }

    /**
     * Searches the given word within the Trie structure
     * @param {String} word 
     */
    search (word) {
        let curNode = this.root;

        for (const letter of word) {
            if (!(letter in curNode.children)) {
                return false;
            }

            curNode = curNode.children[letter];
        }

        return curNode.isEndOfWord;
    }

    /**
     * Searches if the incomplete word is in the trie. Does not check if it is a complete word, just checks if the sequence exists
     * @param {String} word 
     */
    hasSequence(word) {
        let curNode = this.root;

        for (const letter of word) {
            if (!(letter in curNode.children)) {
                return false;
            }

            curNode = curNode.children[letter];
        }

        return true;
    }
}
