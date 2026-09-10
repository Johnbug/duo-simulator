import test from 'node:test';
import assert from 'node:assert/strict';
import { FoldGesture } from '../lib/fold-gesture.mjs';

test('dragging left closes and dragging right reopens continuously',()=>{
 const g=new FoldGesture();g.begin(1,300,180,600);
 assert.equal(g.move(1,150),90);
 assert.equal(g.move(1,200),120);
 assert.equal(g.move(1,300),180);
});
test('supports opening from fully closed without a direction reversal',()=>{
 const g=new FoldGesture();g.begin(7,100,0,400);
 assert.equal(g.move(7,200),90);
 assert.equal(g.move(7,300),180);
});
test('clamps out-of-bounds movement and preserves arbitrary release angles',()=>{
 const g=new FoldGesture();g.begin(1,200,100,600);
 assert.equal(g.move(1,-1000),0);assert.equal(g.move(1,1000),180);
 assert.equal(g.move(1,175),85);assert.equal(g.end(1),85);
 assert.equal(g.move(1,400),null);
});
test('a second touch cannot steal an active fold gesture',()=>{
 const g=new FoldGesture();assert.equal(g.begin(1,100,180,600),true);
 assert.equal(g.begin(2,200,0,600),false);assert.equal(g.move(2,300),null);
 assert.equal(g.end(2),null);assert.equal(g.move(1,0),120);assert.equal(g.end(1),120);
});
test('cancelling releases pointer state and permits the next drag',()=>{
 const g=new FoldGesture();g.begin(1,0,60,300);g.move(1,25);g.end(1);
 assert.equal(g.begin(2,100,90,300),true);assert.equal(g.move(2,75),60);
});
