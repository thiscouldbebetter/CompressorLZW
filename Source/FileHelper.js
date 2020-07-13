
class FileHelper
{
	loadFileAsBytes(systemFileToLoad, callback)
	{
		var fileReader = new FileReader();
		fileReader.onload = (event) =>
		{
			var fileContentsAsBinaryString = fileReader.result;
			var fileContentsAsBytes = [];
			for (var i = 0; i < fileContentsAsBinaryString.length; i++)
			{
				var byteFromFile =
					fileContentsAsBinaryString.charCodeAt(i);
				fileContentsAsBytes.push(byteFromFile);
			}
			callback(fileContentsAsBytes);
		}
		fileReader.readAsBinaryString(systemFileToLoad);
	}

	saveBytesToFileWithName(bytesToSave, fileName)
	{
		var fileAsArrayBuffer = new ArrayBuffer(bytesToSave.length);
		var fileAsArrayUnsigned = new Uint8Array(fileAsArrayBuffer);
		for (var i = 0; i < bytesToSave.length; i++)
		{
			fileAsArrayUnsigned[i] = bytesToSave[i];
		}

		var blobTypeAsLookup= {};
		blobTypeAsLookup["type"] = "unknown/unknown";
		var fileAsBlob = new Blob([fileAsArrayBuffer], blobTypeAsLookup);

		var link = document.createElement("a");
		link.href = window.URL.createObjectURL(fileAsBlob);
		link.download = fileName;
		link.click();
	}
}