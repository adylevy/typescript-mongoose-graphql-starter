declare module 'generate-rsa-keypair' {
    namespace Module {
        interface KeyPair {
            public: string;
            private: string;
        }
    }
    function Module(): Module.KeyPair;
    export = Module;
}