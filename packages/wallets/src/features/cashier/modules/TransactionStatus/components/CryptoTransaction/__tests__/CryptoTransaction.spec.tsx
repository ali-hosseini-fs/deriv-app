import React from 'react';
import { act } from 'react-dom/test-utils';
import { useCancelCryptoTransaction } from '@deriv/api';
import { fireEvent, render, screen } from '@testing-library/react';
import { ModalProvider } from '../../../../../../../components/ModalProvider';
import CryptoTransaction from '../CryptoTransaction';

jest.mock('@deriv/api', () => ({
    useCancelCryptoTransaction: jest.fn(),
}));

const mockModalHide = jest.fn();
jest.mock('../../../../../../../components/ModalProvider', () => ({
    ...jest.requireActual('../../../../../../../components/ModalProvider'),
    useModal: jest.fn(() => ({
        ...jest.requireActual('../../../../../../../components/ModalProvider').useModal(),
        hide: mockModalHide,
    })),
}));

const mockTransaction = {
    address_hash: '1234567890',
    address_url: 'https://example.com/address',
    amount: 0.0002,
    description: 'Transaction description',
    formatted_address_hash: 'abc123',
    formatted_amount: '0.0002 BTC',
    formatted_confirmations: 'Pending',
    formatted_transaction_hash: 'Pending',
    id: '123',
    is_deposit: false,
    is_valid_to_cancel: 1 as const,
    is_withdrawal: true,
    status_code: 'LOCKED' as const,
    status_message:
        "We're reviewing your withdrawal request. You may still cancel this transaction if you wish. Once we start processing, you won't be able to cancel.",
    status_name: 'In review',
    submit_date: 1705399737,
    transaction_type: 'withdrawal' as const,
};

describe('CryptoTransaction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render component with default properties', () => {
        (useCancelCryptoTransaction as jest.Mock).mockReturnValue({ mutate: jest.fn() });

        render(
            <ModalProvider>
                <CryptoTransaction currencyDisplayCode='BTC' transaction={mockTransaction} />
            </ModalProvider>
        );

        expect(screen.getByText('Withdrawal BTC')).toBeInTheDocument();
        expect(screen.getByText(/Pending/)).toBeInTheDocument();
        expect(screen.queryByText(/Confirmations/)).not.toBeInTheDocument();
    });

    it('should render component with correct properties for deposit type transaction', () => {
        const mockDepositTransaction = {
            address_hash: '1234567890',
            address_url: 'https://example.com/address',
            amount: 0.0002,
            description: 'Transaction description',
            formatted_address_hash: 'abc123',
            formatted_amount: '0.0002 BTC',
            formatted_confirmations: 'Pending',
            formatted_transaction_hash: 'Pending',
            id: '123',
            is_deposit: true,
            is_valid_to_cancel: 1 as const,
            is_withdrawal: false,
            status_code: 'LOCKED' as const,
            status_message:
                "We're reviewing your deposit request. You may still cancel this transaction if you wish. Once we start processing, you won't be able to cancel.",
            status_name: 'In review',
            submit_date: 1705399737,
            transaction_type: 'withdrawal' as const,
        };
        (useCancelCryptoTransaction as jest.Mock).mockReturnValue({ mutate: jest.fn() });

        render(
            <ModalProvider>
                <CryptoTransaction currencyDisplayCode='BTC' transaction={mockDepositTransaction} />
            </ModalProvider>
        );

        expect(screen.getByText('Deposit BTC')).toBeInTheDocument();
        expect(screen.getByText(/Confirmations/)).toBeInTheDocument();
        expect(screen.getAllByText(/Pending/)[1]).toBeInTheDocument();
    });

    it('should open modal when cancel button is clicked', async () => {
        const mutateMock = jest.fn();

        (useCancelCryptoTransaction as jest.Mock).mockReturnValue({ mutate: mutateMock });
        document.body.innerHTML = `<div id='wallets_modal_root' />`;

        render(
            <ModalProvider>
                <CryptoTransaction currencyDisplayCode='BTC' transaction={mockTransaction} />
            </ModalProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('dt-wallets-crypto-transactions-cancel-button'));
        });

        expect(screen.getByText("No, don't cancel")).toBeInTheDocument();
        expect(screen.getByText('Yes, cancel')).toBeInTheDocument();
    });

    it('should close modal when cancel negation button is clicked', async () => {
        const mutateMock = jest.fn();

        (useCancelCryptoTransaction as jest.Mock).mockReturnValue({ mutate: mutateMock });
        document.body.innerHTML = `<div id='wallets_modal_root' />`;

        render(
            <ModalProvider>
                <CryptoTransaction currencyDisplayCode='BTC' transaction={mockTransaction} />
            </ModalProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('dt-wallets-crypto-transactions-cancel-button'));
        });

        expect(screen.getByText("No, don't cancel")).toBeInTheDocument();
        expect(screen.getByText('Yes, cancel')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: "No, don't cancel" }));

        expect(mockModalHide).toHaveBeenCalled();
    });

    it('should cancel transaction when cancel confirmation button is clicked', async () => {
        const mutateMock = jest.fn();

        (useCancelCryptoTransaction as jest.Mock).mockReturnValue({ mutate: mutateMock });
        document.body.innerHTML = `<div id='wallets_modal_root' />`;

        render(
            <ModalProvider>
                <CryptoTransaction currencyDisplayCode='BTC' transaction={mockTransaction} />
            </ModalProvider>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('dt-wallets-crypto-transactions-cancel-button'));
        });

        expect(screen.getByText("No, don't cancel")).toBeInTheDocument();
        expect(screen.getByText('Yes, cancel')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Yes, cancel' }));

        expect(mutateMock).toHaveBeenCalled();
        const [[mutationPayload]] = mutateMock.mock.calls;
        expect(mutationPayload).toEqual({ payload: { id: mockTransaction.id } });
    });
});
