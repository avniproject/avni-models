class Displayable {
  private _displayValue: string;
  private _entityObject: any;

  constructor(displayValue: string, entityObject: any) {
    this._displayValue = displayValue;
    this._entityObject = entityObject;
  }

  get displayValue(): string {
    return this._displayValue;
  }

  set displayValue(value: string) {
    this._displayValue = value;
  }

  get entityObject(): any {
    return this._entityObject;
  }

  set entityObject(value: any) {
    this._entityObject = value;
  }
}

export default Displayable;
