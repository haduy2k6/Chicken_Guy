import { patientTheme } from '@/src/Store/usePatientTheme';
import { Alert } from '@heroui/react';
export function AlertStatus(){
    const thisError = patientTheme((s)=>s.error)
    return (
        
        <div>
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                    <Alert.Title>Vui long dang nhap</Alert.Title>
                    <Alert.Description>
                                Dang nhap di thang lozzz
                    </Alert.Description>
                    </Alert.Content>
                </Alert>
        </div>
    );
}