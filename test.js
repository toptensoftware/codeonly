function test()
{
    console.log(arguments.length);
}

let args = [undefined, undefined];
test(...args);