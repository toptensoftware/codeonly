const iconPaths = {
    "science": "M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm0-80h560L520-492v-268h-80v268L200-200Zm280-280Z",
}

export function htmlIcon(name, size)
{
    return `<svg xmlns=http://www.w3.org/2000/svg" height="${size ?? 32}px" width="${size ?? 32}" viewBox="0 -960 960 960"><path d="${iconPaths[name]}"/></svg>`;
}

export function makeIcon(name, size, scale)
{
    scale = scale ?? 1;
    let i = (scale - 1) * 960;
    return {
        type: "svg",
        attr_width: size ?? 32,
        attr_height: size ?? 32,
        attr_viewBox: `${i} ${-960+i} ${960-i*2} ${960-i*2}`,
        attr_preserveAspectRatio: "xMidYMid slice",
        attr_role: "img",
        $: {
            type: "path",
            attr_d: iconPaths[name],
        }
    };
}

