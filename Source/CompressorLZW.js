
class CompressorLZW
{
	// constants
	static SymbolForBitWidthIncrease = 256;
	static SymbolForBitStreamEnd = CompressorLZW.SymbolForBitWidthIncrease + 1;

	// instance methods

	compressBytes(bytesToCompress)
	{
		var bitStream = new BitStream();

		// Adapted from pseudocode found at the URL:
		// http://oldwww.rasip.fer.hr/research/compress/algorithms/fund/lz/lzw.html

		var dictionary = this.initializeDictionary();
		var pattern = "";

		var symbolForBitWidthIncrease = CompressorLZW.SymbolForBitWidthIncrease;
		var symbolWidthInBitsCurrent = Math.ceil
		(
			Math.log(symbolForBitWidthIncrease + 1) 
			/ BitStream.NaturalLogarithmOf2
		);

		for (var i = 0; i < bytesToCompress.length; i++)
		{
			var byteToCompress = bytesToCompress[i];
			var character = String.fromCharCode(byteToCompress);
			var patternPlusCharacter = pattern + character;
			if (dictionary[patternPlusCharacter] == null)
			{
				var dictionaryIndex = dictionary.length;
				dictionary[patternPlusCharacter] = dictionaryIndex;
				dictionary[dictionaryIndex] = patternPlusCharacter;

				var patternEncoded = dictionary[pattern];

				var numberOfBitsRequired = Math.ceil
				(
					Math.log(patternEncoded + 1) 
					/ BitStream.NaturalLogarithmOf2
				);

				if (numberOfBitsRequired > symbolWidthInBitsCurrent)
				{
					bitStream.writeNumber
					(
						symbolForBitWidthIncrease,
						symbolWidthInBitsCurrent
					);

					symbolWidthInBitsCurrent = numberOfBitsRequired;
				}

				bitStream.writeNumber
				(
					patternEncoded,
					symbolWidthInBitsCurrent
				);

				pattern = character;
			}
			else
			{
				pattern = patternPlusCharacter;
			}
		}

		var patternEncoded = dictionary[pattern];
		bitStream.writeNumber
		(
			patternEncoded, 
			symbolWidthInBitsCurrent
		);

		bitStream.writeNumber
		(
			CompressorLZW.SymbolForBitStreamEnd,
			symbolWidthInBitsCurrent
		);

		bitStream.close();

		return bitStream.bytes;
	}

	compressStringToSymbols(stringToCompress)
	{
		var symbolsCompressed = [];

		// Adapted from pseudocode found at the URL:
		// http://oldwww.rasip.fer.hr/research/compress/algorithms/fund/lz/lzw.html

		var dictionary = this.initializeDictionary();
		var pattern = "";

		for (var i = 0; i < stringToCompress.length; i++)
		{
			var character = stringToCompress[i];
			var patternPlusCharacter = pattern + character;
			if (dictionary[patternPlusCharacter] == null)
			{
				var patternEncoded = dictionary[pattern];
				symbolsCompressed.push(patternEncoded);
				
				var dictionaryIndex = dictionary.length;
				dictionary[patternPlusCharacter] = dictionaryIndex;
				dictionary[dictionaryIndex] = patternPlusCharacter;

				pattern = character;
			}
			else
			{
				pattern = patternPlusCharacter;
			}
			
		}

		var patternEncoded = dictionary[pattern];
		symbolsCompressed.push(patternEncoded);

		return symbolsCompressed;
	}

	decompressBytes(bytesToDecode)
	{
		var bytesDecompressed = [];

		// Adapted from pseudocode found at the URL:
		// http://oldwww.rasip.fer.hr/research/compress/algorithms/fund/lz/lzw.html

		var dictionary = this.initializeDictionary();

		var bitStream = new BitStream(bytesToDecode);

		var symbolForBitStreamEnd = CompressorLZW.SymbolForBitStreamEnd;
		var symbolForBitWidthIncrease = CompressorLZW.SymbolForBitWidthIncrease;
		var symbolWidthInBitsCurrent = Math.ceil
		(
			Math.log(symbolForBitWidthIncrease + 1) 
			/ BitStream.NaturalLogarithmOf2
		);

		var symbolToDecode = bitStream.readNumber(symbolWidthInBitsCurrent);
		var symbolDecoded = dictionary[symbolToDecode];
		for (var i = 0; i < symbolDecoded.length; i++)
		{
			bytesDecompressed.push(symbolDecoded.charCodeAt(i));
		}

		var pattern;
		var character;
		var patternPlusCharacter;
	
		while (true) //bitStream.hasMoreBits == true)
		{
			pattern = dictionary[symbolToDecode];
			var symbolNext = bitStream.readNumber
			(
				symbolWidthInBitsCurrent
			);

			if (symbolNext == symbolForBitWidthIncrease)
			{
				symbolWidthInBitsCurrent++;
			}
			else if (symbolNext == symbolForBitStreamEnd)
			{
				break;
			}
			else
			{
				symbolToDecode = symbolNext;
				symbolDecoded = dictionary[symbolToDecode];
	
				if (symbolDecoded == null)
				{
					character = pattern[0];
					patternPlusCharacter = pattern + character;
					for (var i = 0; i < patternPlusCharacter.length; i++)
					{
						bytesDecompressed.push(patternPlusCharacter.charCodeAt(i));
					}
				}
				else
				{
					for (var i = 0; i < symbolDecoded.length; i++)
					{
						bytesDecompressed.push(symbolDecoded.charCodeAt(i));
					}
					character = symbolDecoded[0];
					patternPlusCharacter = pattern + character;
				}

				var dictionaryIndex = dictionary.length;
				dictionary[patternPlusCharacter] = dictionaryIndex;
				dictionary[dictionaryIndex] = patternPlusCharacter;
			}
		}

		return bytesDecompressed;
	}

	initializeDictionary()
	{
		var dictionary = [];

		var firstControlSymbol = CompressorLZW.SymbolForBitWidthIncrease;

		for (var i = 0; i < firstControlSymbol; i++)
		{
			var charCode = String.fromCharCode(i);
			dictionary[charCode] = i;
			dictionary[i] = charCode;
		}

		dictionary[CompressorLZW.SymbolForBitWidthIncrease] = "[WIDEN]";
		dictionary[CompressorLZW.SymbolForBitStreamEnd] = "[END]";

		return dictionary;
	}
}