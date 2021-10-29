export class MockHetznerDns {
    public Zones = {
        GetAll: jest.fn(),
    };

    public Records = {
        GetAll: jest.fn(),
        Create: jest.fn(),
        Delete: jest.fn(),
    };
}
