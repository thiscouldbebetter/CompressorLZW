
class BitStream
{
	constructor(bytes)
	{
		if (bytes == null)
		{
			bytes = [];
		}

		this.bytes = bytes;
		this.byteOffset = 0;
		this.bitOffsetWithinByteCurrent = 0;
		this.byteCurrent = 0;
	}

	// constants

	static BitsPerByte = 8;
	static NaturalLogarithmOf2 = Math.log(2);

	// static methods

	static convertNumberToBitString(numberToConvert)
	{
		var returnValue = "";

		var numberOfBitsNeeded = Math.ceil
		(
			Math.log(numberToConvert + 1)
			/ BitStream.NaturalLogarithmOf2
		);

		if (numberOfBitsNeeded == 0)
		{
			numberOfBitsNeeded = 1;
		}

		for (var b = 0; b < numberOfBitsNeeded; b++)
		{
			var bitValue = (numberToConvert >> b) & 1;
			returnValue = "" + bitValue + returnValue;
		}

		return returnValue;
	}

	// instance methods

	close()
	{
		if (this.bitOffsetWithinByteCurrent > 0)
		{
			this.bytes.push(this.byteCurrent);
		}
	}

	hasMoreBits()
	{
		// todo
		return (this.byteIndexCurrent < this.bytes.length);
	}

	readBit()
	{
		this.byteCurrent = this.bytes[this.byteOffset];
		var returnValue = (this.byteCurrent >> this.bitOffsetWithinByteCurrent) & 1;

		this.bitOffsetWithinByteCurrent++;

		if (this.bitOffsetWithinByteCurrent >= BitStream.BitsPerByte)
		{
			this.byteOffset++;
			this.bitOffsetWithinByteCurrent = 0;
			if (this.byteOffset < this.bytes.length)
			{
				this.byteCurrent = this.bytes[this.byteOffset];
			}
			else
			{
				this.hasMoreBits = false;
			}
		}

		return returnValue;
	}
	
	readNumber(numberOfBitsInNumber)
	{
		var returnValue = 0;

		for (var i = 0; i < numberOfBitsInNumber; i++)
		{
			var bitRead = this.readBit();
			returnValue |= (bitRead << i);
		}

		return returnValue;
	}

	writeBit(bitToWrite)
	{
		this.byteCurrent |= (bitToWrite << this.bitOffsetWithinByteCurrent);

		this.bitOffsetWithinByteCurrent++;

		if (this.bitOffsetWithinByteCurrent >= BitStream.BitsPerByte)
		{
			this.bytes.push(this.byteCurrent);
			this.byteOffset++;
			this.bitOffsetWithinByteCurrent = 0;
			this.byteCurrent = 0;
		}
	}

	writeNumber(numberToWrite, numberOfBitsToUse)
	{
		for (var b = 0; b < numberOfBitsToUse; b++)
		{
			var bitValue = (numberToWrite >> b) & 1;
			this.writeBit(bitValue);
		}
	}
}