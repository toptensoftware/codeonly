import { test } from "node:test";
import { strict as assert } from "node:assert";
import { diff_keys } from "../codeonly/diff_keys.js";

function run_str_diff(oldKeys, newKeys)
{
    oldKeys = oldKeys.split("");
    newKeys = newKeys.split("");
    return run_diff(oldKeys, newKeys);
}

function run_diff(oldKeys, newKeys)
{
    console.log("OLD:", oldKeys.join(","));
    console.log("NEW:", newKeys.join(","));

    let r = oldKeys.map(x => ({ key: x, touched: 0 }));
    let ops = diff_keys(oldKeys,newKeys);
    let pos = 0;

    function touch(from, to)
    {
        for (let i=from; i<to; i++)
        {
            r[i].touched++;
        }
    }

    for (let o of ops)
    {
        console.log("MOD:", r.map(x => x.key).join(","));
        console.log(o);

        if (o.op == 'insert')
        {
            r.splice(o.index, 0, ...newKeys.map(x => ({ key: x, touched: 0}))
                .slice(o.index, o.index + o.count));

            touch(pos, o.index + o.count); 
            pos = o.index + o.count;
        }
        else if (o.op == 'delete')
        {            
            r.splice(o.index, o.count);
            touch(pos, o.index);
            pos = o.index;
        }
        else if (o.op == 'move')
        {
            let sourceKeys = r.slice(o.from, o.from + o.count);
            r.splice(o.from, o.count);
            r.splice(o.to, 0, ...sourceKeys);

            let here = Math.min(o.from, o.to);
            touch(pos, here);
            pos = here;

            touch(o.to, o.to + o.count);
            if (o.from > o.to)
            {
                pos = o.to + o.count;
            }
        }
        else if (o.op == 'skip')
        {
            // nop
            touch(pos, o.index);
            pos = o.index + o.count;
        }
        else
        {
            throw new Error(`unknown diff operation - ${o.op}`);
        }
    };
    touch(pos, r.length);

    console.log("FIN:", r.map(x => x.key).join(","));

    assert.deepStrictEqual(r.map(x => x.key), newKeys);
    assert.deepStrictEqual(r, newKeys.map(x => ({key: x, touched: 1})));
}


test("No-op", () => {
    run_str_diff(
        "0123456789",
        "0123456789",
    );
});

test("Insert", () => {
    run_str_diff(
        "0123456789",
        "01234.56789",
    );
});

test("Delete", () => {
    run_str_diff(
        "01234.56789",
        "0123456789",
    );
});

test("Prepend", () => {
    run_str_diff(
        "0123456789",
        ".0123456789",
    );
});

test("Append", () => {
    run_str_diff(
        "0123456789",
        "0123456789.",
    );
});


test("Move Left", () => {
    run_str_diff(
        "012345.6789",
        "012.3456789",
    );
});

test("Move Right", () => {
    run_str_diff(
        "012.3456789",
        "012345.6789",
    );
});


test("Move Left + Right", () => {
    run_str_diff(
        "0123.45_6789",
        "0.12345678_9",
    );
});

test("Move Right + Left", () => {
    run_str_diff(
        "0.12345678_9",
        "0123.45_6789",
    );
});

test("Move Left + Left", () => {
    run_str_diff(
        "0123.45678_9",
        "0.12345_6789",
    );
});

test("Move Right + Right", () => {
    run_str_diff(
        "0.12345_6789",
        "0123.45678_9",
    );
});

test("Move Left + Left overlapped", () => {
    run_str_diff(
        "0123456_78.9",
        "0_12.3456789",
    );
});


test("Move Right + Right overlapped", () => {
    run_str_diff(
        "0_12.3456789",
        "0123456_78.9",
    );
});

test("Move Left + Right overlapped", () => {
    run_str_diff(
        "0_12345678.9",
        "012.3456_789",
    );
});


test("Move Right + Left overlapped", () => {
    run_str_diff(
        "012.3456_789",
        "0_12345678.9",
    );
});


test("Move Left + Left nested", () => {
    run_str_diff(
        "0123456.78_9",
        "0_12.3456789",
    );
});


test("Move Right + Right nested", () => {
    run_str_diff(
        "0_12.3456789",
        "0123456.78_9",
    );
});

test("Move Left + Right nested", () => {
    run_str_diff(
        "012.345678_9",
        "0_123456.789",
    );
});


test("Move Right + Left nested", () => {
    run_str_diff(
        "0_123456.789",
        "012.345678_9",
    );
});

test("Move Right over delete", () => {
    run_str_diff(
        "0_123.456789",
        "012345678_9",
    );
});

test("Move Left over delete", () => {
    run_str_diff(
        "01234.5678_9",
        "0_123456789",
    );
});

test("Move Right over insert", () => {
    run_str_diff(
        "0_123456789",
        "01234.5678_9",
    );
});

test("Move Left over insert", () => {
    run_str_diff(
        "012345678_9",
        "0_123.456789",
    );
});

test("Move Lefts and join", () => {
    run_str_diff(
        "0123456_78.9",
        "0_.123456789",
    );
});

test("Move Lefts and join swapped", () => {
    run_str_diff(
        "0123456_78.9",
        "0._123456789",
    );
});

test("Move Rights and join", () => {
    run_str_diff(
        "0_1.23456789",
        "01234567_.89",
    );
});

test("Move Rights and join swapped", () => {
    run_str_diff(
        "0_1.23456789",
        "01234567._89",
    );
});


test("Move Right complex", () => {
    run_str_diff(
        "0123456789",
        "0123456789",
    );
});

test("Move Left complex", () => {
    run_str_diff(
        "0123456_7.8,9",
        "0._,123456789",
    );
});


test("Swap Positions", () => {
    run_str_diff(
        "0_12345678.9",
        "0.12345678_9",
    );
});


test("Complex Move Left", () => {
    run_str_diff(
        "012345678_,.9",
        "0_.,123456789",
    );
});

test("Complex Move Right", () => {
    run_str_diff(
        "0_.,123456789",
        "012345678_,.9",
    );
});


test("XXX", { skip: true }, () => {
    
    
    run_diff(
        [ 1,100,200,300,2,3,9 ],
        [ 1,2,3,100,300,200,9 ],
    );
});
    
function random(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;

    return function () {
        s = (s * a) % m;
        return s / m;
    };
}


test("Stress Test", { skip: false }, () => {

    let rF = random(7);
    let r = () => parseInt(rF() * 10000);

    let arr = [];
    let nextKey = 10;
    for (let i=0; i<20; i++)
    {
        arr.push(nextKey++);
    }

    function make_random_edit()
    {
        switch (r() % 3)
        {
            case 0:
            {
                // Insert
                let count = r() % 10;
                let index = arr.length == 0 ? 0 : (r() % arr.length);
                for (let i=0; i<count; i++)
                {
                    arr.splice(index + i, 0, nextKey++);
                }
                break;
            }

            case 1:
            {
                // Delete
                let count = r() % 10;
                let index = 0;
                if (count > arr.length)
                {
                    count = arr.length;
                }
                else
                {
                    index = r() % (arr.length - count);
                }
                arr.splice(index, count);
            }

            case 2:
                let count = r() % 10;
                let index = 0;
                if (count > arr.length)
                {
                    count = arr.length;
                }
                else
                {
                    index = r() % (arr.length - count);
                }
                let save = arr.slice(index, index + count);
                arr.splice(index, count);
                index = arr.length == 0 ? 0 : r() % arr.length;
                arr.splice(index, 0, ...save);
                break;
        }
    }

    for (let i=0; i<1000; i++)
    {
        let original = [...arr];
        let edits = r() % 5;
        for (let e=0; e < edits; e++)
        {
            make_random_edit();
        }
        run_diff(original, arr);
    }

});
