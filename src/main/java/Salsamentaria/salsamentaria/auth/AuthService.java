package Salsamentaria.salsamentaria.auth;

import Salsamentaria.salsamentaria.JWT.JwtService;
import Salsamentaria.salsamentaria.User.Rol;
import Salsamentaria.salsamentaria.User.User;
import Salsamentaria.salsamentaria.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // 🔹 Registro
    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(Rol.CLIENTE)
                .estado(true)
                .build();

        userRepository.save(user);

        String token = jwtService.getToken(user);

        return AuthResponse.builder()
                .token(token)
                .build();
    }

    // 🔹 Login
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtService.getToken(user);

        return AuthResponse.builder()
                .token(token)
                .build();
    }
}
