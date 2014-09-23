
# join

  Join a list in a nice human friendly way.

## Installation

    $ component install component/join

## API

   - [join(arr)](#joinarr)
   - [join(arr, str)](#joinarr-str)
<a name=""></a>

<a name="joinarr"></a>
# join(arr)
should default to "and".

```js
join(['foo', 'bar']).should.equal('foo and bar');
```

<a name="joinarr-str"></a>
# join(arr, str)
should join.

```js
join([], 'and').should.equal('');
join(['foo'], 'and').should.equal('foo');
join(['foo', 'bar'], 'and').should.equal('foo and bar');
join(['foo', 'bar', 'raz'], 'or').should.equal('foo, bar or raz');
```


## License

  MIT
