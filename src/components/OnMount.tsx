import { useEffect } from 'react';

interface IProps {
    onEffect: () => void;
}

export const OnMount = ({ onEffect }: IProps) => {
    useEffect(onEffect, []);
    return null
}