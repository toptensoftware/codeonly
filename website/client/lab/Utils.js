// Compression utilities from :
// https://evanhahn.com/javascript-compression-streams-api-with-strings/

export async function compress(str) 
{
    // Convert the string to a byte stream.
    const stream = new Blob([str]).stream();
  
    // Create a compressed stream.
    const compressedStream = stream.pipeThrough(
        new CompressionStream("gzip")
    );
  
    // Read all the bytes from this stream.
    const chunks = [];
    for await (const chunk of compressedStream) 
    {
        chunks.push(chunk);
    }
    return await concatUint8Arrays(chunks);
}
  
export async function decompress(compressedBytes) 
{
    // Convert the bytes to a stream.
    const stream = new Blob([compressedBytes]).stream();
  
    // Create a decompressed stream.
    const decompressedStream = stream.pipeThrough(
        new DecompressionStream("gzip")
    );
  
    // Read all the bytes from this stream.
    const chunks = [];
    for await (const chunk of decompressedStream) {
        chunks.push(chunk);
    }
    const stringBytes = await concatUint8Arrays(chunks);
  
    // Convert the bytes to a string.
    return new TextDecoder().decode(stringBytes);
}
  

// Helepr to concatenate arrays
async function concatUint8Arrays(uint8arrays) 
{
    const blob = new Blob(uint8arrays);
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
}

// buffer to base64
export async function bufferToBase64(buffer) 
{
    const base64url = await new Promise(r => {
        const reader = new FileReader()
        reader.onload = () => r(reader.result)
        reader.readAsDataURL(new Blob([buffer]))
    });

    // remove the `data:...;base64,` part from the start
    return base64url.slice(base64url.indexOf(',') + 1);
  }

// base64 to buffer
export async function base64ToBuffer(base64) {
    var dataUrl = "data:application/octet-binary;base64," + base64;
    let res = await fetch(dataUrl);
    let buf = await res.arrayBuffer();
    return buf;
}
  