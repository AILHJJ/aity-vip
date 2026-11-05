import assert from 'node:assert/strict'
import {
	DISCUSSION_VIEWS_HIDDEN_KEY,
	getDiscussionViewsHidden,
	setDiscussionViewsHidden
} from '../src/utils/discussionViewPreference.mjs'

const values = new Map()
const storage = {
	getStorageSync: key => values.get(key),
	setStorageSync: (key, value) => values.set(key, value)
}

assert.equal(getDiscussionViewsHidden(storage), false)
assert.equal(setDiscussionViewsHidden(true, storage), true)
assert.equal(getDiscussionViewsHidden(storage), true)
assert.equal(values.get(DISCUSSION_VIEWS_HIDDEN_KEY), true)
assert.equal(setDiscussionViewsHidden(false, storage), true)
assert.equal(getDiscussionViewsHidden(storage), false)
assert.equal(getDiscussionViewsHidden({ getStorageSync() { throw new Error('storage unavailable') } }), false)

console.log('discussion view preference tests passed')
