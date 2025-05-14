export type CountryName = {
    name: {
        common: string;
        official: string;
        nativeName: {
            eng: {
                official: string;
                common: string;
            };
        };
    };
};

export type CountryName_Idd_Cioc = {
    name: {
        common: string;
        official: string;
        nativeName: {
            eng: {
                official: string;
                common: string;
            };
        };
    };
    idd: {
        root: string;
        suffixes: string[];
    };
    cioc: string;
};
